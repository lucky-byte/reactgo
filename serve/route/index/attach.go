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
	"github.com/lucky-byte/reactgo/serve/route/index/tree"
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
		Skipper: func(c echo.Context) bool {
			return false
		},
	}))

	// 登录及找回密码
	signin.Attach(group)
	resetpass.Attach(group)

	// 用户认证
	group.Use(auth.Authentication)

	secretcode.Attach(group) // 验证安全码

	user.Attach(group)
	system.Attach(group)
	tree.Attach(group)
}
