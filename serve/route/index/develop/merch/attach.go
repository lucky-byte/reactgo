package merch

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 600

	group := up.Group("/merch", acl.AllowRead(code))

	group.POST("/", list)
	group.GET("/profile", profile)
	group.GET("/info", getinfo)

	group.Use(acl.AllowWrite(code))

	group.POST("/add", add, acl.AllowRead(601), acl.AllowWrite(601))
	group.PUT("/info", updateinfo)

	group.Use(acl.AllowAdmin(code))

	group.POST("/disable", disable)
	group.DELETE("/delete", del)
}
