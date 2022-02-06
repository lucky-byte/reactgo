package task

import (
	"fmt"
	"os"
	"os/exec"
	"path"
	"strings"
	"syscall"
	"time"

	"github.com/tevino/abool/v2"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

type Job struct {
	Task    db.Task
	Func    func()
	Running abool.AtomicBool
}

func (j *Job) Run() {
	if j.Running.IsSet() {
		xlog.X.Infof("任务'%s'正在执行中，本次调度被忽略", j.Task.Name)
		return
	}
	j.Running.Set()
	defer j.Running.UnSet()

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
		xlog.X.WithError(err).WithField("name", j.Task.Name).
			Error("更新任务运行次数错")
	}
}

// 运行命令
func (j *Job) runCommand() {
	args := strings.Fields(j.Task.Path)
	command := args[0]

	if !path.IsAbs(command) {
		command = path.Join(scheduler.conf.TaskPath(), command)
	}
	i, err := os.Stat(command)
	if err != nil {
		xlog.X.WithError(err).Errorf("执行任务'%s'错", j.Task.Name)
		return
	}
	if i.IsDir() {
		xlog.X.Errorf("%s 是一个目录，不能执行", command)
		return
	}
	if i.Mode().Perm()&0100 == 0 {
		xlog.X.Errorf("%s 不是可执行文件，需要添加执行权限", command)
		return
	}
	var cmd *exec.Cmd

	// 支持命令行选项
	if len(args) == 1 {
		cmd = exec.Command(command)
	} else {
		cmd = exec.Command(command, args[1:]...)
	}

	// 启用新的进程组，避免信号污染
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true, Pgid: 0}

	// 设置环境变量
	dsn := fmt.Sprintf("DSN=%s", scheduler.conf.DatabaseDSN())
	cmd.Env = append(os.Environ(), dsn)

	envs := scheduler.conf.TaskEnv()
	for k, v := range envs {
		s := fmt.Sprintf("%s=%s", strings.ToUpper(k), v)
		cmd.Env = append(cmd.Env, s)
	}

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).
			WithField("name", j.Task.Name).
			WithField("path", j.Task.Path).Error("执行任务错")
	}
	xlog.X.Infof("任务'%s'[%s]输出: %s", j.Task.Name, j.Task.Path, out)
}
