package github

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/route/admin/secretcode"
)

func Attach(up *echo.Group) {
	group := up.Group("/github")

	group.GET("/setting", setting)
	group.PUT("/authorize", authorize, secretcode.Verify())
	group.PUT("/revoke", revoke)
}
