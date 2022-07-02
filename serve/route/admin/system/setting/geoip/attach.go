package geoip

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/geoip", acl.AllowRead(code))

	group.GET("/", config)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/amap-webkey", amapWebKey)
	group.PUT("/amap-enable", amapEnable)
	group.PUT("/tencent-webkey", tencentWebKey)
	group.PUT("/tencent-enable", tencentEnable)
}
