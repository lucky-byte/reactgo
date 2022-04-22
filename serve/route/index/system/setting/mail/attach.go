package mail

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/mail", acl.AllowRead(code))

	group.GET("/list", list)
	group.GET("/info", info)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/modify", modify)
	group.PUT("/sort", sort)
	group.POST("/test", test)

	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.POST("/add", add)
	group.DELETE("/delete", del, secretcode.Verify())
	group.GET("/export", export)
	group.POST("/import", importt)
}
