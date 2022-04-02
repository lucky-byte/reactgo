package event

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
		return cc.BadRequest(err)
	}
	ql := `update events set fresh = false where uuid = ?`

	if err = db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新事件状态错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
