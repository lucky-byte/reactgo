package task

import (
	"fmt"
	"os"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/pkg/errors"
	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	path string
	cron *cron.Cron
}

var scheduler *Scheduler

// 启动任务调度
func Startup(task_path string) error {
	if len(task_path) == 0 {
		return fmt.Errorf("未配置 task.path")
	}
	i, err := os.Stat(task_path)
	if err != nil {
		return errors.Wrap(err, task_path)
	}
	if !i.IsDir() {
		return fmt.Errorf("%s 不是目录", task_path)
	}
	scheduler = &Scheduler{path: task_path}

	scheduler.cron = cron.New(
		cron.WithLogger(cron.DefaultLogger),
		cron.WithChain(
			cron.Recover(cron.DefaultLogger),
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
		cron.WithSeconds(),
	)

	// 查询所有任务
	ql := `select * from tasks where disabled = false`
	var tasks []db.Task

	if err = db.Select(ql, &tasks); err != nil {
		return errors.Wrap(err, "查询任务错")
	}

	// 逐个添加任务
	for _, t := range tasks {
		if t.Type == 1 {
			if err = addFunc(&t); err != nil {
				return errors.Wrapf(err, "添加任务'%s'错", t.Name)
			}
		} else if t.Type == 2 {
			if err = addCommand(&t, task_path); err != nil {
				return errors.Wrapf(err, "添加任务'%s'错", t.Name)
			}
		} else {
			return fmt.Errorf("任务 %s 的类型 %d 无效", t.Name, t.Type)
		}
	}
	// 启动
	scheduler.cron.Start()
	return nil
}

// 停止任务调度
func Stop() {
	if scheduler != nil && scheduler.cron != nil {
		scheduler.cron.Stop()
	}
}
