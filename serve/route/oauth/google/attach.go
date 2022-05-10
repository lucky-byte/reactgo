package google

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/google")

	group.GET("/callback", callback)
}
