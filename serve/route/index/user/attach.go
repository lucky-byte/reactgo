package user

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group) {
	group := up.Group("/user")

	group.GET("/info", info)
	group.PUT("/name", name)
	group.PUT("/userid", userid)
	group.PUT("/email", email, secretcode.Verify())
	group.PUT("/passwd", passwd)
	group.PUT("/address", address)
	group.PUT("/secretcode", scode)
}
