package mail

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

	ql := `select * from mtas order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询邮件服务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var mtas []map[string]interface{}

	for _, v := range result {
		mtas = append(mtas, map[string]interface{}{
			"create_at": v.CreateAt,
			"update_at": v.UpdateAt,
			"name":      v.Name,
			"host":      v.Host,
			"port":      v.Port,
			"sslmode":   v.SSLMode,
			"sender":    v.Sender,
			"replyto":   v.ReplyTo,
			"username":  v.Username,
			"passwd":    v.Passwd,
			"cc":        v.CC,
			"bcc":       v.BCC,
			"prefix":    v.Prefix,
			"sortno":    v.SortNo,
			"nsent":     v.NSent,
			"disabled":  v.Disabled,
		})
	}
	b, err := json.Marshal(mtas)
	if err != nil {
		cc.ErrLog(err).Error("json marshal 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return cc.Download(b, "mailconfig.json")
}
