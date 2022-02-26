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
	var mobile string
	var params []string

	err := echo.FormFieldBinder(c).
		MustInt("n", &n).
		MustString("mobile", &mobile).
		MustStrings("params", &params).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	id, err := sms.MsgID(n)
	if err != nil {
		cc.ErrLog(err).Error("发送短信错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if err = sms.Send([]string{mobile}, id, params); err != nil {
		cc.ErrLog(err).Error("发送短信错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
