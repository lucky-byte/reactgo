package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 重新发送短信验证码
func resend(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	// 发送验证码
	smsid, err := sms.SendCode(user.Mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码错误")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, echo.Map{"smsid": smsid})
}
