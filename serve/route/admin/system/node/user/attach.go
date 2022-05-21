package user

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(g *echo.Group, code int) {
	group := g.Group("/user", acl.AllowRead(code))

	group.GET("/", list)
	group.GET("/candidate", candidate)

	group.Use(acl.AllowWrite(code))

	group.PUT("/add", add)
	group.DELETE("/delete", del)
}
