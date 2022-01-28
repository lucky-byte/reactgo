package settings

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/sms"
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
		"appid":      result.AppId,
		"secret_id":  result.SecretId,
		"secret_key": result.SecretKey,
		"sign":       result.Sign,
		"msgid1":     result.MsgID1,
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

// 修改短信 secret id
func smsSecretId(c echo.Context) error {
	cc := c.(*ctx.Context)

	var secret_id string

	err := echo.FormFieldBinder(c).MustString("secret_id", &secret_id).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set secret_id = ?`

	if err = db.ExecOne(ql, secret_id); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 修改短信 secret key
func smsSecretKey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var secret_key string

	err := echo.FormFieldBinder(c).MustString("secret_key", &secret_key).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set secret_key = ?`

	if err = db.ExecOne(ql, secret_key); err != nil {
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

	var n uint
	var id string

	err := echo.FormFieldBinder(c).
		MustUint("n", &n).MustString("id", &id).BindError()
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

// 发送测试短信
func smsTest(c echo.Context) error {
	cc := c.(*ctx.Context)

	var n int
	var mobile string
	var params []string

	err := echo.FormFieldBinder(c).
		MustInt("n", &n).
		MustString("mobile", &mobile).
		MustStrings("params", &params).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	if err = sms.Send([]string{mobile}, n, params); err != nil {
		cc.ErrLog(err).Error("发送短信错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
