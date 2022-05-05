package oauth

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/signin/oauth/github"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/oauth")

	github.Attach(router)
}
