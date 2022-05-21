package bulletin

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/bulletin")

	group.GET("/", list)
	group.GET("/:uuid", item)
}
