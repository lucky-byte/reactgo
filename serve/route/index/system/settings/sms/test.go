package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 发送测试短信
func test(c echo.Context) error {
	cc := c.(*ctx.Context)

	var n int
	var mobile, code string

	err := echo.FormFieldBinder(c).
		MustInt("n", &n).
		MustString("mobile", &mobile).
		MustString("code", &code).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	err = sms.SendTextNo1([]string{mobile}, []string{code})
	if err != nil {
		cc.ErrLog(err).Error("发送短信错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
