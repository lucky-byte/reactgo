package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改短信 appid
func appid(c echo.Context) error {
	cc := c.(*ctx.Context)

	var appid string

	err := echo.FormFieldBinder(c).MustString("appid", &appid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update sms_settings set appid = ?`

	if err = db.ExecOne(ql, appid); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
