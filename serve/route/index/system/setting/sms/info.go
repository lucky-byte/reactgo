package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询信息
func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &mta_uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select * from smss where uuid = ?`
	var result db.SMS

	if err := db.SelectOne(ql, &result, mta_uuid); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":       result.UUID,
		"create_at":  result.CreateAt,
		"update_at":  result.UpdateAt,
		"isp":        result.ISP,
		"isp_name":   result.ISPName,
		"appid":      result.AppId,
		"secret_id":  result.SecretId,
		"secret_key": result.SecretKey,
		"prefix":     result.Prefix,
		"textno1":    result.TextNo1,
		"sortno":     result.SortNo,
		"nsent":      result.NSent,
	})
}
