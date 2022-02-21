package task

import (
	"fmt"
	"sync"

	"github.com/pkg/errors"
	"github.com/tevino/abool/v2"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

var lock sync.Mutex

// 添加
func Add(t db.Task) error {
	lock.Lock()
	defer lock.Unlock()

	job := &Job{Task: t, Running: *abool.New()}

	if t.Type == 1 {
		f := findFunc(t.Path)

		if f == nil || f.Func == nil {
			return fmt.Errorf("未定义函数'%s'", t.Path)
		}
		job.Func = f.Func
	}
	id, err := scheduler.cron.AddJob(t.Cron, job)
	if err != nil {
		return errors.Wrapf(err, "添加任务'%s'错", t.Name)
	}
	xlog.X.Tracef("添加任务'%s' %d", t.Name, id)
	return nil
}

// 替换
func Replace(t db.Task, uuid string) error {
	lock.Lock()
	defer lock.Unlock()

	for _, e := range Entries() {
		job := e.Job.(*Job)
		if job.Task.UUID == uuid {
			scheduler.cron.Remove(e.ID)
			xlog.X.Tracef("删除任务'%s'", job.Task.Name)
			break
		}
	}
	job := &Job{Task: t, Running: *abool.New()}

	if t.Type == 1 {
		f := findFunc(t.Path)

		if f == nil || f.Func == nil {
			return fmt.Errorf("未定义函数'%s'", t.Path)
		}
		job.Func = f.Func
	}
	id, err := scheduler.cron.AddJob(t.Cron, job)
	if err != nil {
		return errors.Wrapf(err, "添加任务'%s'错", t.Name)
	}
	xlog.X.Tracef("添加任务'%s' %d", t.Name, id)
	return nil
}

// 删除
func Remove(uuid string) error {
	lock.Lock()
	defer lock.Unlock()

	for _, e := range Entries() {
		job := e.Job.(*Job)
		if job.Task.UUID == uuid {
			scheduler.cron.Remove(e.ID)
			xlog.X.Tracef("删除任务'%s'", job.Task.Name)
			return nil
		}
	}
	return fmt.Errorf("未找到任务")
}

// 立即执行
func Fire(uuid string) error {
	lock.Lock()
	defer lock.Unlock()

	for _, e := range Entries() {
		job := e.Job.(*Job)
		if job.Task.UUID == uuid {
			if job.Running.IsSet() {
				return fmt.Errorf("任务正在执行中，本次调度被忽略")
			}
			go func() {
				job.Run()
			}()
			return nil
		}
	}
	return fmt.Errorf("未找到任务")
}
