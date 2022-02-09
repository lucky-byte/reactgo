package event

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var level, page, rows uint
	var days int
	var keyword, fresh string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustInt("days", &days).
		MustUint("level", &level).
		MustString("fresh", &fresh).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	startAt := time.Now().AddDate(0, 0, -days)
	offset := page * rows

	pg := db.NewPagination("events", offset, rows)

	like := goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("message").ILike(keyword),
	)
	pg.Where(like, pg.Col("create_at").Gt(startAt), pg.Col("level").Gte(level))
	if fresh == "true" {
		pg.Where(pg.Col("fresh").Eq(true))
	} else if fresh == "false" {
		pg.Where(pg.Col("fresh").Eq(false))
	}
	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Event

	pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询事件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var events []echo.Map

	for _, h := range records {
		events = append(events, echo.Map{
			"uuid":      h.UUID,
			"create_at": h.CreateAt,
			"level":     h.Level,
			"title":     h.Title,
			"message":   h.Message,
			"fresh":     h.Fresh,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "events": events})
}
