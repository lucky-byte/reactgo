package geoip

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改 web 服务 key
func webkey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var key string

	err := echo.FormFieldBinder(c).MustString("key", &key).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update geoip set webkey = ?`

	if err = db.ExecOne(ql, key); err != nil {
		cc.ErrLog(err).Error("更新 geoip 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
