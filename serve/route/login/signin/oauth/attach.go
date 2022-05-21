package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/login/signin/oauth/github"
	"github.com/lucky-byte/reactgo/serve/route/login/signin/oauth/google"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/oauth")

	github.Attach(router)
	google.Attach(router)
}
