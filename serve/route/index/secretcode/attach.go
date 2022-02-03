package secretcode

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/secretcode")

	group.PUT("/verify", verify)
}
