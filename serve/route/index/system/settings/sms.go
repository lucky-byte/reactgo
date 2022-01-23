package settings

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func smsSettings(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from sms_settings`
	var result db.SmsSettings

	err := db.SelectOne(ql, &result)
	if err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"appid":  result.AppId,
		"appkey": result.AppKey,
	})
}

func smsAppid(c echo.Context) error {
	cc := c.(*ctx.Context)

	var appid string

	err := echo.FormFieldBinder(c).MustString("appid", &appid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set appid = ?`

	if err = db.ExecOne(ql, appid); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

func smsAppkey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var appkey string

	err := echo.FormFieldBinder(c).MustString("appkey", &appkey).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set appkey = ?`

	if err = db.ExecOne(ql, appkey); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
