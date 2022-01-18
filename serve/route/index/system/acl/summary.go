package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func summary(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, summary string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).MustString("summary", &summary).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		update acl set summary = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, summary, uuid); err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
