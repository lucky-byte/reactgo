package notification

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/notification")

	group.GET("/", list)
	group.GET("/last", last)
	group.GET("/:uuid", item)
	group.DELETE("/:uuid", del)
	group.PUT("/clear", clear)
	group.POST("/popup", popup)
	group.POST("/browser", browser)
}
