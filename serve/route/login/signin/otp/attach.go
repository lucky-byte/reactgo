package otp

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/lib/jwt2"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/otp")

	router.Use(checkToken)

	router.PUT("/verify", verify)
}

// 登录 Token 必须有效
func checkToken(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		// 获取登录 TOKEN
		authToken := c.Request().Header.Get("x-auth-token")
		if len(authToken) == 0 {
			cc.Log().Error("短信认证请求缺少访问 TOKEN")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 解析登录 TOKEN
		jwt, err := jwt2.JWTParse(authToken)
		if err != nil {
			cc.ErrLog(err).Error("短信认证解析登录 TOKEN 错")
			return c.NoContent(http.StatusUnauthorized)
		}
		if len(jwt.User) == 0 {
			cc.Log().Error("短信认证登录 TOKEN.user 无效")
			return c.NoContent(http.StatusUnauthorized)
		}

		// 查询用户信息
		ql := `select * from users where uuid = ?`
		var user db.User

		err = db.SelectOne(ql, &user, jwt.User)
		if err != nil {
			cc.ErrLog(err).Error("查询用户信息错")
			return c.NoContent(http.StatusInternalServerError)
		}
		cc.SetUser(&user)

		return next(c)
	}
}
