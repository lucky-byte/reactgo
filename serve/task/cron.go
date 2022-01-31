package task

import (
	"fmt"

	"github.com/robfig/cron/v3"
)

var scheduler *cron.Cron
var ids []cron.EntryID

// 启动任务调度
func Startup() error {
	scheduler = cron.New()

	id, err := scheduler.AddFunc("30 * * * *", func() {
		fmt.Println("Every hour on the half hour")
	})
	if err != nil {
		return err
	}
	ids = append(ids, id)

	job := newJob("/tmp/abcdef")
	_, err = scheduler.AddJob("* * * * *", job)
	if err != nil {
		return err
	}
	scheduler.Start()
	return nil
}

// 停止任务调度
func Stop() {
	if scheduler != nil {
		scheduler.Stop()
	}
}
