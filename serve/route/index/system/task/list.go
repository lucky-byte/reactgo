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

	var page, rows_per_page uint
	var keyword string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows_per_page", &rows_per_page).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows_per_page

	t := goqu.T("tasks")

	var where goqu.Expression = goqu.ExOr{
		"name":    goqu.Op{"ilike": keyword},
		"summary": goqu.Op{"ilike": keyword},
		"path":    goqu.Op{"ilike": keyword},
	}

	// 查询总数
	b := db.From(t).Select(goqu.COUNT("*")).Where(where)
	ql, _, err := b.ToSQL()
	if err != nil {
		cc.ErrLog(err).Error("构造 SQL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var total int

	if err := db.SelectOne(ql, &total); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 查询列表
	b = db.From(t).
		Select(t.Col("*")).
		Where(where).
		Order(t.Col("create_at").Desc()).
		Offset(offset).Limit(rows_per_page)

	ql, _, err = b.ToSQL()
	if err != nil {
		cc.ErrLog(err).Error("构造 SQL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var result []db.Task

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询任务信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var tasks []echo.Map

	for _, u := range result {
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
			"nfailed":   u.NFailed,
			"disabled":  u.Disabled,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"total": total, "tasks": tasks})
}
