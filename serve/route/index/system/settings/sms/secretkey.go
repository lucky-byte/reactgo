package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改短信 secret key
func secretKey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var secret_key string

	err := echo.FormFieldBinder(c).MustString("secret_key", &secret_key).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update sms_settings set secret_key = ?`

	if err = db.ExecOne(ql, secret_key); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
