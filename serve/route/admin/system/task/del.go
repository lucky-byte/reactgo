package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/task"
)

func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 停止任务
	if err = task.Remove(uuid); err != nil {
		cc.ErrLog(err).Error("停止任务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 删除
	ql := `delete from tasks where uuid = ?`

	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除任务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
