package task

import (
	"fmt"
	"os"
	"path"

	"github.com/pkg/errors"
	"github.com/robfig/cron/v3"
)

type Scheduler struct {
	path string
	cron *cron.Cron
}

var scheduler *Scheduler

// 启动任务调度
func Startup(fpath string) error {
	if len(fpath) == 0 {
		return fmt.Errorf("未配置 task.path")
	}
	i, err := os.Stat(fpath)
	if err != nil {
		return errors.Wrap(err, fpath)
	}
	if !i.IsDir() {
		return fmt.Errorf("%s 不是目录", fpath)
	}
	scheduler = &Scheduler{
		path: fpath,
	}

	scheduler.cron = cron.New(
		cron.WithLogger(cron.DefaultLogger),
		cron.WithChain(
			cron.Recover(cron.DefaultLogger),
			cron.SkipIfStillRunning(cron.DefaultLogger),
		),
		cron.WithSeconds(),
	)

	// id, err := scheduler.AddFunc("30 * * * *", func() {
	// 	fmt.Println("Every hour on the half hour")
	// })
	// if err != nil {
	// 	return err
	// }
	// ids = append(ids, id)

	job := newCommandJob(path.Join(fpath, "test.sh"))
	_, err = scheduler.cron.AddJob("* * * * * *", job)
	if err != nil {
		return err
	}
	scheduler.cron.Start()
	return nil
}

// 停止任务调度
func Stop() {
	if scheduler != nil && scheduler.cron != nil {
		scheduler.cron.Stop()
	}
}
