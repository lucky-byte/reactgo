package admin

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/route/admin/bulletin"
	"github.com/lucky-byte/reactgo/serve/route/admin/system"
	"github.com/lucky-byte/reactgo/serve/route/admin/user"
	"github.com/lucky-byte/reactgo/serve/route/lib/auth"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

// 后台管理模块
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

	// 查询 NATS 配置信息，用于客户端连接消息通道
	group.GET("/nats", nats)

	// 统一验证安全码
	secretcode.Attach(group)

	// 用户可以访问账号菜单中的功能
	user.Attach(group)

	// 后续操作记录操作审计
	group.Use(opsRecorder)

	// 检查用户访问角色是否允许进一步操作
	group.Use(aclCheck)

	system.Attach(group) // 系统管理
}

// 检查用户访问角色
func aclCheck(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		// 访问角色带有 openpt 特征禁止访问
		for _, feature := range cc.AclFeatures() {
			if strings.ToLower(feature) == "openpt" {
				cc.Log().Warn("此功能不允许带有'开放平台'特征的角色访问")
				return c.NoContent(http.StatusForbidden)
			}
		}
		return next(c)
	}
}
