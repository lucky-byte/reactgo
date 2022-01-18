package manage

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 400

	group := up.Group("/manage", acl.AllowRead(code))

	group.POST("/", list)
	group.GET("/profile", profile)
	group.GET("/info", getinfo)

	group.Use(acl.AllowWrite(code))

	group.POST("/add", add, acl.AllowRead(401), acl.AllowWrite(401))
	group.PUT("/info", updateinfo)

	group.Use(acl.AllowAdmin(code))

	group.POST("/disable", disable)
	group.DELETE("/delete", del)
}
