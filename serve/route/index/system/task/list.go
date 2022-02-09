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

	var page, rows uint
	var keyword string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("tasks", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("name").ILike(keyword),
		pg.Col("summary").ILike(keyword),
		pg.Col("path").ILike(keyword),
	))
	pg.Select(pg.Col("*")).OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Task

	if err = pg.Exec(&count, &records); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var tasks []echo.Map

	for _, u := range records {
		tasks = append(tasks, echo.Map{
			"uuid":      u.UUID,
			"create_at": u.CreateAt,
			"update_at": u.UpdateAt,
			"name":      u.Name,
			"summary":   u.Summary,
			"cron":      u.Cron,
			"type":      u.Type,
			"path":      u.Path,
			"last_fire": u.LastFire,
			"nfire":     u.NFire,
			"disabled":  u.Disabled,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "tasks": tasks})
}
