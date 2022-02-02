package user

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/user")

	group.GET("/info", info)
	group.PUT("/name", name)
	group.PUT("/userid", userid)
	group.PUT("/passwd", passwd)
	group.PUT("/address", address)
	group.PUT("/secretcode", secretcode)
}
