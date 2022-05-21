package acl

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func features(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string
	var features []string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).MustStrings("features", &features).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `
		update acl set features = ?, update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, strings.Join(features, ","), uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
