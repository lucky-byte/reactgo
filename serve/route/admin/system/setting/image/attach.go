package image

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/image", acl.AllowRead(code))

	group.GET("/", get)

	group.Use(acl.AllowWrite(code))

	group.POST("/place", place)
	group.POST("/rootpath", rootpath)
}
