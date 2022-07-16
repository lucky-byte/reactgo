package debug

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/debug", acl.AllowRead(code))

	group.GET("/", get)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/", set)
}
