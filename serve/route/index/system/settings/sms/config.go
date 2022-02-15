package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询短信配置
func config(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from sms_settings`
	var result db.SmsSetting

	err := db.SelectOne(ql, &result)
	if err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"appid":      result.AppId,
		"secret_id":  result.SecretId,
		"secret_key": result.SecretKey,
		"sign":       result.Sign,
		"msgid1":     result.MsgID1,
	})
}
