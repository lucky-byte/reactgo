package task

import (
	"fmt"
	"os"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/pkg/errors"
	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	cron *cron.Cron
	conf *config.ViperConfig
}

var scheduler *Scheduler

// 启动任务调度
func Startup(conf *config.ViperConfig) error {
	root := conf.TaskPath()

	if len(root) == 0 {
		return fmt.Errorf("未配置 task.path")
	}
	i, err := os.Stat(root)
	if err != nil {
		return errors.Wrap(err, root)
	}
	if !i.IsDir() {
		return fmt.Errorf("%s 不是目录", root)
	}
	scheduler = &Scheduler{conf: conf}

	scheduler.cron = cron.New(
		cron.WithLogger(cron.DefaultLogger),
		cron.WithChain(
			cron.Recover(cron.DefaultLogger),
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
		cron.WithParser(cron.NewParser(
			cron.SecondOptional|cron.Minute|cron.Hour|
				cron.Dom|cron.Month|cron.Dow|cron.Descriptor,
		)),
	)

	// 查询所有任务
	ql := `select * from tasks where disabled = false`
	var tasks []db.Task

	if err = db.Select(ql, &tasks); err != nil {
		return errors.Wrap(err, "查询任务错")
	}

	// 逐个添加任务
	for _, t := range tasks {
		if t.Type != 1 && t.Type != 2 {
			return fmt.Errorf("任务'%s'的类型 %d 无效", t.Name, t.Type)
		}
		if err := Add(t); err != nil {
			return errors.Wrapf(err, "添加任务'%s'错", t.Name)
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

// 运行中的任务
func Entries() []cron.Entry {
	if scheduler == nil || scheduler.cron == nil {
		return nil
	}
	return scheduler.cron.Entries()
}
