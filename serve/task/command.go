package task

import (
	"os"
	"os/exec"
	"path"
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/pkg/errors"
	"github.com/robfig/cron/v3"
)

type commandJob struct {
	task    *db.Task
	path    string
	entryId cron.EntryID
}

func newCommandJob(t *db.Task, fpath string) *commandJob {
	return &commandJob{t, fpath, 0}
}

func (j *commandJob) Run() {
	i, err := os.Stat(j.path)
	if err != nil {
		xlog.X.WithError(err).WithField("name", j.task.Name).Error("执行任务错")
		return
	}
	if i.IsDir() {
		xlog.F("name", j.task.Name).Errorf("%s 是一个目录，不能执行", j.path)
		return
	}
	startTime := time.Now()

	cmd := exec.Command(j.path)

	// 设置环境变量
	cmd.Env = append(os.Environ(), "")

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).WithField("name", j.task.Name).Error("执行任务错")
	}
	elapsed := time.Since(startTime).Milliseconds()

	xlog.F("name", j.task.Name).Debugf(
		"命令 %s 执行完成，耗费 %d 毫秒，输出: %s", j.task.Name, elapsed, out,
	)
	// 如果执行时间太长，发起一个警告
	if elapsed > 300 {
		xlog.F("name", j.task.Name).Warnf(
			"命令 %s 执行耗费 %d 毫秒", j.task.Name, elapsed,
		)
	}
}

// 添加 command job
func addCommand(t *db.Task, task_path string) error {
	job := newCommandJob(t, path.Join(task_path, t.Path))

	id, err := scheduler.cron.AddJob(t.Cron, job)
	if err != nil {
		return errors.Wrapf(err, "添加任务 %s 错", t.Name)
	}
	job.entryId = id
	return nil
}
