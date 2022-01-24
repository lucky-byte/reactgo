package settings

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

// 查询短信配置
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
		"sign":   result.Sign,
		"msgid1": result.MsgID1,
	})
}

// 修改短信 appid
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

// 修改短信 appkey
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

// 修改短信签名
func smsSign(c echo.Context) error {
	cc := c.(*ctx.Context)

	var sign string

	err := echo.FormFieldBinder(c).MustString("sign", &sign).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set sign = ?`

	if err = db.ExecOne(ql, sign); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 修改正文模板 ID
func smsMsgId(c echo.Context) error {
	cc := c.(*ctx.Context)

	var n, id uint

	err := echo.FormFieldBinder(c).MustUint("n", &n).MustUint("id", &id).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := fmt.Sprintf(`update sms_settings set msgid%d = ?`, n)

	if err = db.ExecOne(ql, id); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
