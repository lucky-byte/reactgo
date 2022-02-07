package event

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/event", acl.AllowRead(code))

	group.POST("/", list)
	group.PUT("/unfresh", unfresh)
}
