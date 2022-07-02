package geoip

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改 web 服务 key
func tencentWebKey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var key string

	err := echo.FormFieldBinder(c).MustString("key", &key).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update geoip set tencent_webkey = ?`

	if err = db.ExecOne(ql, key); err != nil {
		cc.ErrLog(err).Error("更新 geoip 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 启用腾讯定位
func tencentEnable(c echo.Context) error {
	cc := c.(*ctx.Context)

	var enable bool

	err := echo.FormFieldBinder(c).MustBool("enable", &enable).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update geoip set tencent_enable = ?`

	if err = db.ExecOne(ql, enable); err != nil {
		cc.ErrLog(err).Error("更新 geoip 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
