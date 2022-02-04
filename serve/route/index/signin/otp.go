package signin

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/pquerna/otp/totp"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
)

// 验证短信验证码
func otpVerify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var code string

	err := echo.FormFieldBinder(c).MustString("code", &code).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		c.String(http.StatusBadRequest, "请求数据不完整")
	}
	// 获取登录 TOKEN
	authToken := c.Request().Header.Get("x-auth-token")
	if len(authToken) == 0 {
		cc.Log().Error("请求缺少访问 TOKEN")
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	// 解析登录 TOKEN
	jwt, err := auth.JWTParse(authToken)
	if err != nil {
		cc.ErrLog(err).Error("解析登录 TOKEN 错")
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	if len(jwt.User) == 0 {
		cc.Log().Error("登录 TOKEN.user 无效")
		return c.String(http.StatusBadRequest, "无效的请求")
	}

	// 查询用户 TOTP 密钥
	ql := `select totp_secret from users where uuid = ?`
	var totp_secret string

	if err = db.SelectOne(ql, &totp_secret, jwt.User); err != nil {
		cc.ErrLog(err).Error("查询用户 TOTP 密钥错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 验证 TOTP 口令
	if !totp.Validate(code, totp_secret) {
		return c.String(http.StatusBadRequest, "口令错误")
	}

	// 重新生成登录TOKEN
	ql = `select token_duration from settings`
	var duration time.Duration

	if err = db.SelectOne(ql, &duration); err != nil {
		cc.ErrLog(err).Error("查询设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newJwt := auth.NewAuthJWT(jwt.User, true, duration*time.Minute)
	token, err := auth.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).Error("生成登录 TOKEN 错")
		return c.String(http.StatusInternalServerError, "服务器内部错")
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token})
}
