package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/oauth", acl.AllowRead(code))

	group.GET("/github", githubGet)
	group.GET("/google", googleGet)
	group.GET("/microsoft", microsoftGet)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/github", githubSet)
	group.PUT("/google", googleSet)
	group.PUT("/microsoft", microsoftSet)
}
