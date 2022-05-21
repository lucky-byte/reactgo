package admin

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/route/admin/auth"
	"github.com/lucky-byte/reactgo/serve/route/admin/bulletin"
	"github.com/lucky-byte/reactgo/serve/route/admin/secretcode"
	"github.com/lucky-byte/reactgo/serve/route/admin/system"
	"github.com/lucky-byte/reactgo/serve/route/admin/user"
)

func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/admin")

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

	bulletin.Attach(group) // 公开公告

	// 后续操作都需要通过认证
	group.Use(auth.Authentication)

	group.GET("/nats", nats) // 查询 NATS 配置信息，用于客户端连接消息通道
	secretcode.Attach(group) // 验证用户安全码
	user.Attach(group)       // 用户可以访问的功能

	// 角色带有 openpt 特征的用户不能进行后续操作
	group.Use(openptForbidden)

	group.Use(opsRecorder) // 后续操作都会记录操作审计

	system.Attach(group) // 系统管理
}

// 用户访问角色带有 openpt 特征禁止访问
func openptForbidden(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		for _, feature := range cc.AclFeatures() {
			if strings.ToLower(feature) == "openpt" {
				cc.Log().Warn("此功能不允许带有'开放平台'特征的角色访问")
				return c.NoContent(http.StatusForbidden)
			}
		}
		return next(c)
	}
}
