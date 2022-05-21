package login

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/login/resetpass"
	"github.com/lucky-byte/reactgo/serve/route/login/signin"
)

func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/login")

	// CSRF token
	group.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSecure:   conf.ServerSecure(),
		CookieSameSite: http.SameSiteStrictMode,
		TokenLookup:    "header:X-Csrf-Token",
		Skipper: func(c echo.Context) bool {
			return false
		},
	}))

	signin.Attach(group)    // 登录
	resetpass.Attach(group) // 找回密码
}
