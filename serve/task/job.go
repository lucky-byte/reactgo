package task

import (
	"fmt"
	"os/exec"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

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
	c := exec.Command(j.path)
	if o, err := c.Output(); err != nil {
		xlog.X.WithError(err).Error("执行任务错")
	} else {
		fmt.Printf(">: %s", o)
	}
}
