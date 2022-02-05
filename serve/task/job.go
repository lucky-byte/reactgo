package task

import (
	"os"
	"os/exec"
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/robfig/cron/v3"
)

type Job struct {
	Task    db.Task
	Func    func()
	Command string
	EntryId cron.EntryID
}

func (j Job) Run() {
	now := time.Now()

	if j.Task.Type == 1 {
		if j.Func == nil {
			xlog.X.Error("任务'%s'未定义函数", j.Task.Name)
		} else {
			j.Func()
		}
	} else {
		j.runCommand()
	}
	elapsed := time.Since(now).Milliseconds()

	xlog.X.Debugf("任务 %s 执行完成，耗时 %d 毫秒", j.Task.Name, elapsed)

	if elapsed > 300 {
		xlog.X.Warnf("任务 %s 执行耗时 %d 毫秒", j.Task.Name, elapsed)
	}
	ql := `
		update tasks set nfire = nfire + 1, last_fire = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, j.Task.UUID); err != nil {
		xlog.X.WithError(err).Error("更新任务运行次数错")
	}
}

// 运行命令
func (j Job) runCommand() {
	i, err := os.Stat(j.Command)
	if err != nil {
		xlog.X.WithError(err).Errorf("执行任务'%s'错", j.Task.Name)
		return
	}
	if i.IsDir() {
		xlog.X.Errorf("%s 是一个目录，不能执行", j.Command)
		return
	}
	cmd := exec.Command(j.Command)

	// 设置环境变量
	cmd.Env = append(os.Environ(), "")

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).WithField("name", j.Task.Name).Error("执行任务错")
	}
	xlog.X.Infof("任务'%s'输出: %s", j.Task.Name, out)
}
