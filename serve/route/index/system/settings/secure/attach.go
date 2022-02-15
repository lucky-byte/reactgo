package secure

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/secure", acl.AllowRead(code))

	group.GET("/config", config)

	group.Use(acl.AllowWrite(code)) // Write 权限
	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.PUT("/resetpass", resetpass)
	group.PUT("/duration", duration)
}
