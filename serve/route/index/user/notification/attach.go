package notification

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/notification")

	group.GET("/last", last)
}
