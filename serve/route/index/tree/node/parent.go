package node

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改父节点
func parent(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, parent string

	err := echo.FormFieldBinder(c).
		MustString("parent", &parent).MustString("uuid", &uuid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from tree where uuid = ?`
	var node, parentNode db.Tree

	// 查询准备转移的节点
	if err := db.SelectOne(ql, &node, uuid); err != nil {
		cc.ErrLog(err).Error("查询节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询新的父节点
	if err := db.SelectOne(ql, &parentNode, parent); err != nil {
		cc.ErrLog(err).Error("查询节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 不能以当前节点的子节点作为新的父节点
	if strings.HasPrefix(parentNode.TPath, node.TPath) {
		return c.String(http.StatusBadRequest, "不能设置子节点作为新的父节点")
	}

	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("启动数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新当前节点的父节点
	ql = `
		update tree set up = ?, sortno = (
			select coalesce(max(sortno), 0) + 1 from tree where up = ?
		) where uuid = ?
	`
	_, err = tx.Exec(tx.Rebind(ql), parentNode.UUID, parentNode.UUID, uuid)
	if err != nil {
		tx.Rollback()
		cc.ErrLog(err).Error("更新节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新当前节点所有子节点的 tpath 和 nlevel
	ql = `select * from tree where tpath like ?`
	var nodes []db.Tree

	if err = tx.Select(&nodes, tx.Rebind(ql), node.TPath+"%"); err != nil {
		tx.Rollback()
		cc.ErrLog(err).Error("查询节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newPath := strings.Split(parentNode.TPath, ".")
	newPath = append(newPath, node.UUID)
	newPrefix := strings.Join(newPath, ".")

	for _, n := range nodes {
		p := strings.Replace(n.TPath, node.TPath, newPrefix, 1)
		l := len(strings.Split(p, "."))

		ql = `update tree set tpath = ?, nlevel = ? where uuid = ?`

		_, err = tx.Exec(tx.Rebind(ql), p, l, n.UUID)
		if err != nil {
			tx.Rollback()
			cc.ErrLog(err).Error("更新节点错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
