package task

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/task"
)

// 查询正在运行的任务
func entries(c echo.Context) error {
	var entries []echo.Map

	for _, e := range task.Entries() {
		job, _ := e.Job.(*task.Job)

		entries = append(entries, echo.Map{
			"uuid":     job.Task.UUID,
			"name":     job.Task.Name,
			"cron":     job.Task.Cron,
			"path":     job.Task.Path,
			"running":  job.Running.IsSet(),
			"entry_id": e.ID,
			"next":     e.Next.Format(time.RFC3339),
			"prev":     e.Prev.Format(time.RFC3339),
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"entries": entries})
}
