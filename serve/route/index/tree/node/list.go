package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询所有节点
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select uuid, name, disabled from tree order by nlevel, sortno`
	var records []db.Tree

	if err := db.Select(ql, &records); err != nil {
		cc.ErrLog(err).Error("查询层次结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var nodes []echo.Map

	for _, v := range records {
		nodes = append(nodes, echo.Map{
			"uuid":     v.UUID,
			"name":     v.Name,
			"disabled": v.Disabled,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"nodes": nodes})
}
