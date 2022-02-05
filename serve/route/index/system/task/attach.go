package task

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group) {
	code := 1500

	group := up.Group("/task", acl.AllowRead(code))

	group.POST("/list", list)
	group.GET("/testcron", testcron)
	group.GET("/funcs", funcs)
	group.GET("/entries", entries)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code))

	// group.PUT("/info", updateinfo)
	group.PUT("/fire", fire)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.POST("/disable", disable)
	group.DELETE("/delete", del, secretcode.Verify())
}
