package user

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(g *echo.Group, code int) {
	group := g.Group("/user", acl.AllowRead(code))

	group.GET("/", list)
}
