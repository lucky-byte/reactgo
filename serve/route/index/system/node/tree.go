package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询所有节点
func tree(c echo.Context) error {
	cc := c.(*ctx.Context)

	// 可以设置显示的根节点
	uuid := c.QueryParam("root")

	var records []db.Tree

	if len(uuid) > 0 {
		ql := `select tpath from tree where uuid = ?`
		var tpath string

		if err := db.SelectOne(ql, &tpath, uuid); err != nil {
			cc.ErrLog(err).Error("查询层级结构错")
			return c.NoContent(http.StatusInternalServerError)
		}
		ql = `select * from tree where tpath like ? order by nlevel, sortno`

		if err := db.Select(ql, &records, tpath+"%"); err != nil {
			cc.ErrLog(err).Error("查询层级结构错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		ql := `select * from tree order by nlevel, sortno`
		if err := db.Select(ql, &records); err != nil {
			cc.ErrLog(err).Error("查询层级结构错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	if len(records) == 0 {
		cc.Log().Error("层级结构为空")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 以第一个节点作为根节点
	root := echo.Map{
		"uuid":     records[0].UUID,
		"name":     records[0].Name,
		"tpath":    records[0].TPath,
		"disabled": records[0].Disabled,
	}
	if !records[0].Disabled {
		buildTree(root, records[0].UUID, records)
	}
	return c.JSON(http.StatusOK, echo.Map{"tree": root})
}

// 递归加入子节点，构造一个树结构
func buildTree(parent echo.Map, up string, nodes []db.Tree) {
	for _, node := range nodes {
		if node.Up == up {
			child := echo.Map{
				"uuid":     node.UUID,
				"name":     node.Name,
				"tpath":    node.TPath,
				"disabled": node.Disabled,
			}
			if children, ok := parent["children"]; ok {
				v := children.([]echo.Map)
				parent["children"] = append(v, child)
			} else {
				parent["children"] = []echo.Map{child}
			}
			// 禁用的节点不再继续递归
			if !node.Disabled {
				buildTree(child, node.UUID, nodes)
			}
		}
	}
}
