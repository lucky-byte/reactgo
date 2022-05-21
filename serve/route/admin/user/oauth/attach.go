package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/user/oauth/github"
	"github.com/lucky-byte/reactgo/serve/route/admin/user/oauth/google"
)

func Attach(up *echo.Group) {
	group := up.Group("/oauth")

	github.Attach(group)
	google.Attach(group)
}
