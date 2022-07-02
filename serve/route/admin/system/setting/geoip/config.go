package geoip

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func config(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from geoip`
	var result db.GeoIP

	if err := db.SelectOne(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询 Geoip 信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"amap_webkey":    result.AMapWebKey,
		"amap_enable":    result.AMapEnable,
		"tencent_webkey": result.TencentWebKey,
		"tencent_enable": result.TencentEnable,
	})
}
