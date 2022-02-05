package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 查询信息
	ql := `select * from tasks where uuid = ?`
	var task db.Task

	if err = db.SelectOne(ql, &task, uuid); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"create_at": task.CreateAt,
		"update_at": task.UpdateAt,
		"name":      task.Name,
		"summary":   task.Summary,
		"cron":      task.Cron,
		"type":      task.Type,
		"path":      task.Path,
		"last_fire": task.LastFire,
		"nfire":     task.NFire,
		"disabled":  task.Disabled,
		"note":      task.Note.String,
	})
}
