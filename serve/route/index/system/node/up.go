package node

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 上移
func up(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select * from tree where uuid = ?`
	var node db.Tree

	if err = db.SelectOne(ql, &node, uuid); err != nil {
		cc.ErrLog(err).Error("查询节点信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 计算兄弟节点的 tpath 前缀
	arr := strings.Split(node.TPath, ".")
	if len(arr) < 2 {
		return c.String(http.StatusBadRequest, "不能移动该节点")
	}
	tpath := strings.Join(arr[:len(arr)-1], ".")

	// 查询要交换序号的兄弟节点
	ql = `
		select * from tree where tpath like ? and nlevel = ? and sortno < ?
		order by sortno desc limit 1
	`
	var sibling []db.Tree

	err = db.Select(ql, &sibling, tpath+"%", node.NLevel, node.SortNo)
	if err != nil {
		cc.ErrLog(err).Error("查询节点信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 没有前面的节点
	if len(sibling) == 0 {
		return c.String(http.StatusBadRequest, "不能上移，已经在最前面")
	}
	// 交换两个节点的序号
	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("启动数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `update tree set sortno = ? where uuid = ?`

	_, err = tx.Exec(tx.Rebind(ql), sibling[0].SortNo, uuid)
	if err != nil {
		tx.Rollback()
		cc.ErrLog(err).Error("更新节点序号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	_, err = tx.Exec(tx.Rebind(ql), node.SortNo, sibling[0].UUID)
	if err != nil {
		tx.Rollback()
		cc.ErrLog(err).Error("更新节点序号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
