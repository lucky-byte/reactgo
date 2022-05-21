package mail

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/mail", acl.AllowRead(code))

	group.GET("/list", list)
	group.GET("/info", info)
	group.POST("/test", test)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.POST("/add", add)
	group.PUT("/modify", modify)
	group.PUT("/sort", sort)

	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.POST("/export", export)
	group.POST("/import", importt)
	group.PUT("/disable", disable)
	group.DELETE("/delete", del, secretcode.Verify())
}
