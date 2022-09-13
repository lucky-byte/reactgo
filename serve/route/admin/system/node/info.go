package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询节点信息
func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	uuid := c.QueryParam("uuid")
	if len(uuid) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from tree where uuid = ?`
	var node db.Tree

	err := db.SelectOne(ql, &node, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询层级结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询节点绑定的用户列表
	ql = `
		select u.name as user_name from tree_bind as tb
		left join users as u on u.uuid = tb.entity
		where tb.type = 1 and tb.node = ?
		order by tb.create_at desc
	`
	var users []string

	err = db.Select(ql, &users, node.UUID)
	if err != nil {
		cc.ErrLog(err).Error("查询层级结构绑定用户错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":      node.UUID,
		"create_at": node.CreateAt,
		"update_at": node.UpdateAt,
		"name":      node.Name,
		"summary":   node.Summary,
		"up":        node.Up,
		"nlevel":    node.NLevel,
		"tpath":     node.TPath,
		"disabled":  node.Disabled,
		"sortno":    node.SortNo,
		"users":     users,
	})
}
