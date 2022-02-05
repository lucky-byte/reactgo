package task

import (
	"os"
	"os/exec"
	"path"
	"strings"
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

type Job struct {
	Task    db.Task
	Func    func()
	running bool
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
		xlog.X.WithError(err).WithField("name", j.Task.Name).
			Error("更新任务运行次数错")
	}
}

// 运行命令
func (j Job) runCommand() {
	if j.running {
		xlog.X.Infof("任务'%s'正在执行中，本次调度被忽略", j.Task.Name)
		return
	}
	j.running = true
	defer func() { j.running = false }()

	args := strings.Fields(j.Task.Path)
	command := args[0]

	if !path.IsAbs(command) {
		command = path.Join(scheduler.root, command)
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

	if len(args) == 1 {
		cmd = exec.Command(command)
	} else {
		cmd = exec.Command(command, args[1:]...)
	}

	// 设置环境变量
	cmd.Env = append(os.Environ(), "")

	// 执行命令
	out, err := cmd.CombinedOutput()
	if err != nil {
		xlog.X.WithError(err).
			WithField("name", j.Task.Name).
			WithField("path", j.Task.Path).Error("执行任务错")
	}
	xlog.X.Infof("任务'%s'[%s]输出: %s", j.Task.Name, j.Task.Path, out)
}
