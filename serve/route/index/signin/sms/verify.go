package sms

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
func verify(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var smsid, code, historyid string
	var trust bool

	err := echo.FormFieldBinder(c).
		MustString("smsid", &smsid).
		MustString("code", &code).
		Bool("trust", &trust).
		String("historyid", &historyid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&smsid, &code, &historyid)

	// 验证短信验证码
	err = sms.VerifyCode(smsid, code, user.Mobile)
	if err != nil {
		cc.ErrLog(err).Error("登录验证短信验证码失败")
		return c.String(http.StatusBadRequest, err.Error())
	}
	// 重新生成登录TOKEN
	ql := `select sessduration from account`
	var duration time.Duration

	err = db.SelectOne(ql, &duration)
	if err != nil {
		cc.ErrLog(err).Error("查询设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newJwt := auth.NewAuthJWT(user.UUID, true, duration*time.Minute)

	token, err := auth.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).Error("生成登录 TOKEN 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 信任设备
	if trust && len(historyid) > 0 {
		ql = `update signin_history set trust = true where uuid = ?`

		if err = db.ExecOne(ql, historyid); err != nil {
			cc.ErrLog(err).Error("更新登录历史错")
		}
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token})
}
