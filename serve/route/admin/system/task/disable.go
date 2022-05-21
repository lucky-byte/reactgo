package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/task"
)

func disable(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select * from tasks where uuid = ?`
	var t db.Task

	if err = db.SelectOne(ql, &t, uuid); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if t.Disabled {
		if err = task.Replace(t, uuid); err != nil {
			cc.ErrLog(err).Error("恢复任务调度错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		if err = task.Remove(uuid); err != nil {
			cc.ErrLog(err).Error("停止任务调度错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	// 更新状态
	ql = `
		update tasks set disabled = not disabled, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
