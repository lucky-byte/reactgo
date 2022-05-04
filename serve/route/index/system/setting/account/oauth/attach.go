package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/oauth", acl.AllowRead(code))

	group.GET("/github", githubGet)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/github", githubSet)

	group.Use(acl.AllowAdmin(code)) // Admin 权限
}
