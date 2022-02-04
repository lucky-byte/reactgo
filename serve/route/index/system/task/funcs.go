package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/task"
)

// 查询函数列表
func funcs(c echo.Context) error {
	var funcs []echo.Map

	for _, v := range task.Funcs {
		funcs = append(funcs, echo.Map{"name": v.Name, "path": v.Path})
	}
	return c.JSON(http.StatusOK, echo.Map{"funcs": funcs})
}
