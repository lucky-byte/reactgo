package node

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/node", acl.AllowRead(code))

	group.GET("/", tree)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code))

	group.PUT("/name", name)
	group.PUT("/summary", summary)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.PUT("/disable", disable)
	group.PUT("/enable", enable)
	group.PUT("/delete", del)
}
