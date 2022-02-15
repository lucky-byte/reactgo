package sms

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/sms", acl.AllowRead(code))

	group.GET("/config", config)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/appid", appid)
	group.PUT("/secretid", secretId)
	group.PUT("/secretkey", secretKey)
	group.PUT("/sign", sign)
	group.PUT("/msgid", msgid)

	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.POST("/test", test)
}
