package node

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询所有节点
func tree(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from tree order by nlevel, sortno`
	var records []db.Tree

	if err := db.Select(ql, &records); err != nil {
		cc.ErrLog(err).Error("查询层级结构错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(records) == 0 {
		cc.Log().Error("层级结构为空")
		return c.NoContent(http.StatusInternalServerError)
	}
	cc.Log().Infof("节点数量: %d", len(records))

	root := echo.Map{
		"uuid":     records[0].UUID,
		"name":     records[0].Name,
		"disabled": records[0].Disabled,
	}
	buildTree(root, records[0].UUID, records)

	cc.Log().Infof("tree: %#v", root)

	var nodes []echo.Map

	for _, v := range records {
		nodes = append(nodes, echo.Map{
			"uuid":     v.UUID,
			"name":     v.Name,
			"summary":  v.Summary,
			"up":       v.Up,
			"disabled": v.Disabled,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"tree": root})
}

// 递归加入子节点，构造一个树结构
func buildTree(parent echo.Map, up string, nodes []db.Tree) {
	fmt.Printf("UP : %s\n", up)

	for _, node := range nodes {
		if node.Up == up {
			fmt.Printf("添加子节点: %s\n", node.Name)
			child := echo.Map{
				"uuid":     node.UUID,
				"name":     node.Name,
				"disabled": node.Disabled,
			}
			if children, ok := parent["children"]; ok {
				v := children.([]echo.Map)
				parent["children"] = append(v, child)
			} else {
				parent["children"] = []echo.Map{child}
			}
			buildTree(child, node.UUID, nodes)
		}
	}
}
