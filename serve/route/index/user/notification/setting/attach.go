package setting

import (
	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group) {
	group := up.Group("/setting")

	group.POST("/popup", popup)
	group.POST("/browser", browser)
	group.POST("/mail", mail)
}
