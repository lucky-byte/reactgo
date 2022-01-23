package history

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 1200

	group := up.Group("/history", acl.AllowRead(code))

	group.POST("/", list)
}
