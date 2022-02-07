package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 改为已读
func unfresh(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		update notifications set fresh = false where uuid = ? and touser = ''
	`
	if err = db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
