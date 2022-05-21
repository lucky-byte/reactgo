package acl

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/acl", acl.AllowRead(code))

	group.GET("/", list)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code))

	group.PUT("/name", name)
	group.PUT("/summary", summary)
	group.PUT("/features", features)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.DELETE("/delete", del)

	group.POST("/allow/add", allowAdd)
	group.GET("/allow/list", allowList)
	group.POST("/allow/remove", allowRemove)
	group.PUT("/allow/update", allowUpdate)
}
