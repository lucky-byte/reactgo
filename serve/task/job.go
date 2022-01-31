package task

import "fmt"

type taskJob struct {
	path string
}

func newJob(path string) *taskJob {
	return &taskJob{
		path: path,
	}
}

func (j *taskJob) Run() {
	fmt.Println(j.path)
}
