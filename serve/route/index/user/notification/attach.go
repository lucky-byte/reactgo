package notification

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/notification")

	group.POST("/", list)
	group.GET("/:uuid", item)
	group.GET("/last", last)
}
