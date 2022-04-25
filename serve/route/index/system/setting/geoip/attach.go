package geoip

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/geoip", acl.AllowRead(code))

	group.GET("/", config)
	// group.GET("/info", info)
	// group.POST("/test", test)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/amap-webkey", amapWebKey)
	group.PUT("/amap-enable", amapEnable)

	// group.PUT("/modify", modify)
	// group.PUT("/sort", sort)

	// group.Use(acl.AllowAdmin(code)) // Admin 权限

	// group.POST("/export", export)
	// group.POST("/import", importt)
	// group.PUT("/disable", disable)
	// group.DELETE("/delete", del, secretcode.Verify())
}
