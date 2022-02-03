package secretcode

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

// 验证安全操作码
func Verify() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := c.(*ctx.Context)
			user := cc.User()

			// 如果用户未设置安全操作码，则不用验证
			if len(user.SecretCode) == 0 {
				return next(c)
			}
			// 获取 TOKEN
			token := c.FormValue("secretcode_token")
			if len(token) == 0 {
				token = c.QueryParam("secretcode_token")
			}
			if len(token) == 0 {
				return c.String(http.StatusForbidden, "该操作需验证安全操作码")
			}
			if err := verifyToken(user.UUID, token); err != nil {
				cc.ErrLog(err).Error("验证安全操作码失败")
				return c.String(http.StatusForbidden, "验证安全操作码失败")
			}
			return next(c)
		}
	}
}
