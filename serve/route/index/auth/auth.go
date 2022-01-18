package auth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func Authentication(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		// 验证登录 TOKEN
		authToken := c.Request().Header.Get("x-auth-token")
		if len(authToken) == 0 {
			cc.Log().Error("认证失败: 请求缺少认证 TOKEN")
			return c.NoContent(http.StatusUnauthorized)
		}
		jwt, err := JWTParse(authToken)
		if err != nil {
			cc.ErrLog(err).Error("认证失败")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 还未激活
		if !jwt.Activate {
			cc.Log().Error("TOKEN 尚未激活，可能还未完成 2FA 认证")
			return c.NoContent(http.StatusUnauthorized)
		}
		ql := `select * from users where uuid = ?`
		var user db.User

		// 查询用户信息
		if err = db.SelectOne(ql, &user, jwt.User); err != nil {
			cc.ErrLog(err).Error("认证失败，未查询到用户信息")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 检查用户状态
		if user.Disabled || user.Deleted {
			cc.Log().Error("认证失败，用户已被禁用或删除")
			return c.NoContent(http.StatusUnauthorized)
		}
		cc.SetUser(&user)

		// 查询用户访问控制
		ql = `select * from acl_allows where acl = ?`
		var allows []db.ACLAllow

		if err = db.Select(ql, &allows, user.ACL); err != nil {
			cc.ErrLog(err).Error("查询用户访问控制错误")
			return c.NoContent(http.StatusUnauthorized)
		}
		cc.SetAllows(allows)

		return next(c)
	}
}
