package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 发送测试短信
func test(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, mobile, code string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("code", &code).
		MustString("mobile", &mobile).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select * from smss where uuid = ?`
	var record db.SMS

	if err = db.SelectOne(ql, &record, uuid); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 发送验证码短信
	err = sms.SendWith(&record, []string{mobile}, 1, []string{code})
	if err != nil {
		cc.ErrLog(err).Error("发送短信错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
