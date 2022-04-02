package task

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/task"
)

// 添加任务
func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var name, cron_exp, func_name, fpath, summary string
	var task_type int

	err := echo.FormFieldBinder(c).
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
	// 添加记录
	ql := `
		insert into tasks (uuid, name, cron, type, path, summary)
		values (?, ?, ?, ?, ?, ?)
	`
	u := uuid.NewString()

	err = db.ExecOne(ql, u, name, cron_exp, task_type, fpath, summary)
	if err != nil {
		cc.ErrLog(err).Error("添加任务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 添加调度
	t := db.Task{
		UUID:    u,
		Name:    name,
		Summary: summary,
		Cron:    cron_exp,
		Type:    task_type,
		Path:    fpath,
	}
	if err = task.Add(t); err != nil {
		cc.ErrLog(err).Error("添加任务调度错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
