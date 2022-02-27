package user

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询已绑定用户
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	node := c.QueryParam("node")
	if len(node) == 0 {
		cc.Log().Error("请求参数无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		select tb.*, u.name as name
		from tree_bind as tb
		left join users as u on u.uuid = tb.entity
		where node = ? and type = 1
	`
	type result struct {
		db.TreeBind
		Name string `db:"name"` // 用户名
	}
	var records []result

	err := db.Select(ql, &records, node)
	if err != nil {
		cc.ErrLog(err).Error("查询节点绑定错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, v := range records {
		list = append(list, echo.Map{
			"uuid":      v.UUID,
			"create_at": v.CreateAt,
			"node":      v.Node,
			"entity":    v.Entity,
			"name":      v.Name,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
