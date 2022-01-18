package history

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	group := up.Group("/history", acl.AllowRead(730))

	group.POST("/", list)
}
