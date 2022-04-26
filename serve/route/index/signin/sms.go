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

	var smsid, code, clientid, historyid string

	err := echo.FormFieldBinder(c).
		MustString("smsid", &smsid).
		MustString("code", &code).
		String("clientid", &clientid).
		String("historyid", &historyid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&smsid, &code, &clientid, &historyid)

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
	ql = `select sessduration from account`
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
	// 记录信任设备
	if len(clientid) > 0 && len(historyid) > 0 {
		ql = `update signin_history set clientid = ?, trust = true where uuid = ?`

		if err = db.ExecOne(ql, clientid, historyid); err != nil {
			cc.ErrLog(err).Error("更新登录历史错")
		}
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
