package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func summary(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, summary string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).MustString("summary", &summary).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&summary)

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
