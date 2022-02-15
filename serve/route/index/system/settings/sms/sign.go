package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改短信签名
func sign(c echo.Context) error {
	cc := c.(*ctx.Context)

	var sign string

	err := echo.FormFieldBinder(c).MustString("sign", &sign).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set sign = ?`

	if err = db.ExecOne(ql, sign); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
