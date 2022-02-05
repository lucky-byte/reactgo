package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/task"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 查询正在运行的任务
func entries(c echo.Context) error {
	entries := task.Entries()
	var result []echo.Map

	for _, e := range entries {
		xlog.X.Infof("job: %v", e.Job)

		result = append(result, echo.Map{
			"id": e.ID,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"entries": result})
}
