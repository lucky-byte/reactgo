package sms

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 导出
func export(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from smss order by sortno`
	var result []db.SMS

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询短信服务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var smss []map[string]any

	for _, v := range result {
		smss = append(smss, map[string]any{
			"create_at":  v.CreateAt,
			"update_at":  v.UpdateAt,
			"isp":        v.ISP,
			"isp_name":   v.ISPName,
			"appid":      v.AppId,
			"secret_id":  v.SecretId,
			"secret_key": v.SecretKey,
			"prefix":     v.Prefix,
			"textno1":    v.TextNo1,
			"sortno":     v.SortNo,
			"nsent":      v.NSent,
			"disabled":   v.Disabled,
		})
	}
	b, err := json.Marshal(smss)
	if err != nil {
		cc.ErrLog(err).Error("json marshal 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return cc.Download(b, "smsconfig.json")
}
