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
	task    *db.Task
	fn      func()
	command string
	entryid cron.EntryID
}

func (j Job) Run() {
	now := time.Now()

	if j.task.Type == 1 {
		if j.fn == nil {
			xlog.X.Error("任务'%s'未定义函数", j.task.Name)
		} else {
			j.fn()
		}
	} else {
		j.runCommand()
	}
	elapsed := time.Since(now).Milliseconds()

	xlog.X.Debugf("任务 %s 执行完成，耗时 %d 毫秒", j.task.Name, elapsed)

	if elapsed > 300 {
		xlog.X.Warnf("任务 %s 执行耗时 %d 毫秒", j.task.Name, elapsed)
	}
	ql := `
		update tasks set nfire = nfire + 1, last_fire = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, j.task.UUID); err != nil {
		xlog.X.WithError(err).Error("更新任务运行次数错")
	}
}

// 运行命令
func (j Job) runCommand() {
	i, err := os.Stat(j.command)
	if err != nil {
		xlog.X.WithError(err).Errorf("执行任务'%s'错", j.task.Name)
		return
	}
	if i.IsDir() {
		xlog.X.Errorf("%s 是一个目录，不能执行", j.command)
		return
	}
	cmd := exec.Command(j.command)

	// 设置环境变量
	cmd.Env = append(os.Environ(), "")

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).WithField("name", j.task.Name).Error("执行任务错")
	}
	xlog.X.Infof("任务'%s'输出: %s", j.task.Name, out)
}
