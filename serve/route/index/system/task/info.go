package task

import (
	"net/http"
	"os"
	"path"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询信息
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
		cc.ErrLog(err).Error("无效的请求")
		return c.String(http.StatusBadRequest, "无效的请求")
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
	// 检查 cron 表达式
	parser := cron.NewParser(
		cron.SecondOptional | cron.Minute | cron.Hour |
			cron.Dom | cron.Month | cron.Dow | cron.Descriptor,
	)
	if _, err := parser.Parse(cron_exp); err != nil {
		cc.ErrLog(err).Error("解析 cron 表达式错")
		return c.String(http.StatusBadRequest, "表达式无效: "+err.Error())
	}
	// 检查文件是否存在并可以执行
	if task_type == 2 {
		p := fpath

		if !path.IsAbs(fpath) {
			p = path.Join(cc.Config().TaskPath(), fpath)
		}
		i, err := os.Stat(p)
		if err != nil {
			cc.ErrLog(err).Error("检查文件错")
			return c.String(http.StatusBadRequest, "路径指向的文件不存在")
		}
		if i.IsDir() {
			return c.String(http.StatusBadRequest, "路径指向的不是常规文件")
		}
		if i.Mode().Perm()&0100 == 0 {
			return c.String(http.StatusBadRequest, "路径指向的不是可执行文件")
		}
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
	return c.NoContent(http.StatusOK)
}
