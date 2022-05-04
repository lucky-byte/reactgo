package oauth

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/route/index/user/oauth/github"
)

func Attach(up *echo.Group) {
	group := up.Group("/oauth")

	github.Attach(group)
}
