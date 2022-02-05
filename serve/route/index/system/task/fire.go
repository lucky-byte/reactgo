package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func fire(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// 更新状态
	ql := `
		update tasks set disabled = not disabled, update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
