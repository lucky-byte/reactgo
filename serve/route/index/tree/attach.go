package tree

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/tree/node"
)

const (
	menuCodeNode = 9200
)

func Attach(up *echo.Group) {
	group := up.Group("/tree")

	node.Attach(group, menuCodeNode)
}
