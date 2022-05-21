package node

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 移动到最前面
func top(c echo.Context) error {
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

	// 查询兄弟节点最小的序号
	ql = `select min(sortno) from tree where tpath like ? and nlevel = ?`
	var sortno int

	if err = db.SelectOne(ql, &sortno, tpath+"%", node.NLevel); err != nil {
		cc.ErrLog(err).Error("查询节点信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 将当前节点的序号设置为最小值 - 1
	ql = `update tree set sortno = ? where uuid = ?`

	if err = db.ExecOne(ql, sortno-1, uuid); err != nil {
		cc.ErrLog(err).Error("更新节点序号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
