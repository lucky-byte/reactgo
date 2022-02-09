package signin

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 验证短信验证码
func smsVerify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var smsid, code string

	err := echo.FormFieldBinder(c).
		MustString("smsid", &smsid).MustString("code", &code).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
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

	// 查询用户手机号
	ql := `select mobile from users where uuid = ?`
	var mobile string

	if err = db.SelectOne(ql, &mobile, jwt.User); err != nil {
		cc.ErrLog(err).Error("登录验证短信验证码时查询用户手机号错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 验证短信验证码
	err = sms.VerifyCode(smsid, code, mobile)
	if err != nil {
		cc.ErrLog(err).WithField("mobile", mobile).Error("登录验证短信验证码失败")
		return c.String(http.StatusBadRequest, err.Error())
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
		cc.ErrLog(err).WithField("mobile", mobile).Error("生成登录 TOKEN 错")
		return c.String(http.StatusInternalServerError, "服务器内部错")
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token})
}

// 重新发送短信验证码
func smsResend(c echo.Context) error {
	cc := c.(*ctx.Context)

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

	// 查询用户手机号
	ql := `select mobile from users where uuid = ?`
	var mobile string

	if err = db.SelectOne(ql, &mobile, jwt.User); err != nil {
		cc.ErrLog(err).Error("查询用户手机号错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 重新发送验证码
	smsid, err := sms.SendCode(mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码错误")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, echo.Map{"smsid": smsid})
}
