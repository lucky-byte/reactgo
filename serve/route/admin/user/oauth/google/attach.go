package google

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

func Attach(up *echo.Group) {
	group := up.Group("/google")

	group.GET("/setting", setting)
	group.PUT("/authorize", authorize, secretcode.Verify())
	group.PUT("/revoke", revoke)
}
