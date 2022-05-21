package notification

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/user/notification/setting"
)

func Attach(up *echo.Group) {
	group := up.Group("/notification")

	group.GET("/", list)
	group.GET("/last", last)
	group.GET("/:uuid", item)
	group.DELETE("/:uuid", del)
	group.PUT("/clear", clear)

	setting.Attach(group)
}
