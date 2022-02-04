package task

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 1500

	group := up.Group("/task", acl.AllowRead(code))

	group.POST("/list", list)
	group.GET("/funcs", funcs)
	group.GET("/testcron", testcron)
	// group.GET("/profile", profile)

	group.Use(acl.AllowWrite(code))

	// group.PUT("/info", updateinfo)
	// group.PUT("/passwd", passwd)
	// group.PUT("/acl", aclUpdate)

	group.Use(acl.AllowAdmin(code))

	// group.POST("/add", add)
	// group.POST("/clearsecretcode", clearSecretCode)
	// group.POST("/cleartotp", clearTOTP)
	// group.POST("/disable", disable)
	// group.DELETE("/delete", del)
}
