package bank

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 610

	group := up.Group("/bank", acl.AllowRead(code))

	group.POST("/", list)
	group.GET("/profile", profile)
	group.GET("/info", getinfo)

	group.Use(acl.AllowWrite(code))

	group.POST("/add", add, acl.AllowRead(611), acl.AllowWrite(611))
	group.PUT("/info", updateinfo)

	group.Use(acl.AllowAdmin(code))

	group.POST("/disable", disable)
	group.DELETE("/delete", del)
}
