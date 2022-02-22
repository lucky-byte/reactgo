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

	if err := db.SelectOne(ql, &node, uuid); err != nil {
		cc.ErrLog(err).Error("查询层级结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":    node.UUID,
		"name":    node.Name,
		"summary": node.Summary,
		"up":      node.Up,
		"nlevel":  node.NLevel,
		"tpath":   node.TPath,
		"diabled": node.Disabled,
	})
}
