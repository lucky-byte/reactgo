package user

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 1000

	group := up.Group("/user", acl.AllowRead(code))

	group.POST("/list", list)
	group.GET("/profile", profile)
	group.GET("/info", getinfo)

	group.Use(acl.AllowWrite(code))

	group.PUT("/info", updateinfo)
	group.PUT("/passwd", passwd)
	group.PUT("/acl", aclUpdate)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.POST("/disable", disable)
	group.DELETE("/delete", del)
}
