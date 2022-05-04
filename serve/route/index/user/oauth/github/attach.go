package github

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/github")

	group.GET("/setting", setting)
	group.GET("/open", open)
}
