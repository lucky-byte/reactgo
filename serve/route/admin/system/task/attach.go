package task

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/task", acl.AllowRead(code))

	group.GET("/list", list)
	group.GET("/testcron", testcron)
	group.GET("/funcs", funcs)
	group.GET("/entries", entries)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code))

	group.PUT("/info", infoUpdate)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.POST("/fire", fire)
	group.POST("/disable", disable)
	group.DELETE("/delete", del, secretcode.Verify())
}
