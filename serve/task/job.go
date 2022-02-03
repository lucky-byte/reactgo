package task

import (
	"os"
	"os/exec"
	"time"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

type commandJob struct {
	path string
}

func newCommandJob(path string) *commandJob {
	return &commandJob{
		path: path,
	}
}

func (j *commandJob) Run() {
	i, err := os.Stat(j.path)
	if err != nil {
		xlog.X.WithError(err).WithField("path", j.path).Error("执行任务错")
		return
	}
	if i.IsDir() {
		xlog.F("path", j.path).Errorf("%s 是一个目录，不能执行", j.path)
		return
	}
	startTime := time.Now()

	cmd := exec.Command(j.path)

	// 设置环境变量
	cmd.Env = append(os.Environ(), "")

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).WithField("path", j.path).Error("执行任务错")
	}
	elapsed := time.Since(startTime).Milliseconds()

	xlog.F("path", j.path).Debugf("命令执行完成，耗费 %d 毫秒，输出: %s", elapsed, out)

	// 如果执行时间太长，发起一个警告
	if elapsed > 300 {
		xlog.F("path", j.path).Warnf("命令执行耗费 %d 毫秒", elapsed)
	}
}
