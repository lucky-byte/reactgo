package index

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/route/index/resetpass"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
	"github.com/lucky-byte/reactgo/serve/route/index/signin"
	"github.com/lucky-byte/reactgo/serve/route/index/system"
	"github.com/lucky-byte/reactgo/serve/route/index/user"
)

func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/r")

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

	group.Use(auth.Authentication) // 用户认证

	group.GET("/nats", nats) // NATS 配置

	secretcode.Attach(group) // 验证安全码

	user.Attach(group)   // 用户设置
	system.Attach(group) // 系统管理
}
