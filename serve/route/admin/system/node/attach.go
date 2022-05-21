package node

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/system/node/user"
	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(g *echo.Group, code int) {
	group := g.Group("/node", acl.AllowRead(code))

	user.Attach(group, code)

	group.GET("/", tree)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code))

	group.PUT("/top", top)
	group.PUT("/bottom", bottom)
	group.PUT("/up", up)
	group.PUT("/down", down)
	group.PUT("/name", name)
	group.PUT("/summary", summary)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.PUT("/delete", del)
	group.PUT("/disable", disable)
	group.PUT("/enable", enable)
	group.PUT("/parent", parent)
}
