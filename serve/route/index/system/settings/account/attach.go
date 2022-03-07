package account

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/account", acl.AllowRead(code))

	group.GET("/config", config)

	group.Use(acl.AllowWrite(code)) // Write 权限
	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.PUT("/lookuserid", lookuserid)
	group.PUT("/resetpass", resetpass)
	group.PUT("/duration", duration)
}
