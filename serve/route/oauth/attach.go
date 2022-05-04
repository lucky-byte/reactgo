package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/oauth/github"
)

func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/oauth")

	github.Attach(group)
}
