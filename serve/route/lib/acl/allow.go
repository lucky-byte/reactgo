package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 检查 read 访问控制
func AllowRead(code int) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc, ok := c.(*ctx.Context)
			if !ok {
				xlog.X.Panic("echo.context 无效, 该中间件调用上下文不正确")
			}
			if !cc.AllowRead(code) {
				user := cc.User()
				cc.Log().Errorf("用户 %s 未开通 %d 访问权限", user.Name, code)
				return c.String(http.StatusForbidden, "未开通此功能访问权限")
			}
			return next(c)
		}
	}
}

// 检查 write 访问控制
func AllowWrite(code int) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc, ok := c.(*ctx.Context)
			if !ok {
				xlog.X.Panic("echo.context 无效, 该中间件调用上下文不正确")
			}
			if !cc.AllowWrite(code) {
				user := cc.User()
				cc.Log().Errorf("用户 %s 未开通 %d 修改权限", user.Name, code)
				return c.String(http.StatusForbidden, "未开通此功能访问权限")
			}
			return next(c)
		}
	}
}

// 检查 admin 访问控制
func AllowAdmin(code int) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc, ok := c.(*ctx.Context)
			if !ok {
				xlog.X.Panic("echo.context 无效, 该中间件调用上下文不正确")
			}
			if !cc.AllowAdmin(code) {
				user := cc.User()
				cc.Log().Errorf("用户 %s 未开通 %d 管理权限", user.Name, code)
				return c.String(http.StatusForbidden, "未开通此功能访问权限")
			}
			return next(c)
		}
	}
}
