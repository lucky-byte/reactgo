package task

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/task"
)

// 查询信息
func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
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

// 修改信息
func infoUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, name, cron_exp, func_name, fpath, summary string
	var task_type int

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("name", &name).
		MustString("cron", &cron_exp).
		MustInt("type", &task_type).
		String("func", &func_name).
		String("path", &fpath).
		String("summary", &summary).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&name, &cron_exp, &func_name, &fpath, &summary)

	// 检查任务类型
	if task_type != 1 && task_type != 2 {
		return c.String(http.StatusBadRequest, "任务类型无效")
	}
	if task_type == 1 { // 内置函数，将函数名记录到 path
		fpath = func_name
	}
	if len(fpath) == 0 {
		return c.String(http.StatusBadRequest, "未上传函数名或文件路径")
	}
	// 检查路径是否有效
	if err = task.IsPathValid(fpath, task_type); err != nil {
		cc.ErrLog(err).Error("检查路径错")
		return c.String(http.StatusBadRequest, err.Error())
	}
	// 检查 cron 表达式
	parser := cron.NewParser(
		cron.SecondOptional | cron.Minute | cron.Hour |
			cron.Dom | cron.Month | cron.Dow | cron.Descriptor,
	)
	if _, err := parser.Parse(cron_exp); err != nil {
		cc.ErrLog(err).Error("解析 cron 表达式错")
		return c.String(http.StatusBadRequest, "表达式无效: "+err.Error())
	}
	// 更新信息
	ql := `
		update tasks set
			name = ?, summary = ?, cron = ?, type = ?, path = ?,
			update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, name, summary, cron_exp, task_type, fpath, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 重新查询任务信息用于调度，为了兼容 mysql 等数据库，上面不能使用 returning 子句
	ql = `select * from tasks where uuid = ?`
	var t db.Task

	if err = db.SelectOne(ql, &t, uuid); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果没有禁用的话，重新调度
	if !t.Disabled {
		if err = task.Replace(t, uuid); err != nil {
			cc.ErrLog(err).Error("替换任务调度错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	return c.NoContent(http.StatusOK)
}
