package task

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var page, rows, task_type uint
	var keyword string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		Uint("type", &task_type).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("tasks", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("name").ILike(keyword),
		pg.Col("summary").ILike(keyword),
		pg.Col("path").ILike(keyword),
	))
	if task_type > 0 {
		pg.Where(pg.Col("type").Eq(task_type))
	}
	pg.Select(pg.Col("*")).OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Task

	if err = pg.Exec(&count, &records); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": records})
}
