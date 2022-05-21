package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/task"
)

func fire(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select disabled from tasks where uuid = ?`
	var disabled bool

	if err = db.SelectOne(ql, &disabled, uuid); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if disabled {
		return c.String(http.StatusForbidden, "当前任务已被禁用，不能执行")
	}
	if err = task.Fire(uuid); err != nil {
		cc.ErrLog(err).Error("立即执行任务错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
