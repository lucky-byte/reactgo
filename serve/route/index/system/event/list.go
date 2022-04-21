package event

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

	var level, page, rows uint
	var keyword, fresh string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustUint("level", &level).
		MustString("fresh", &fresh).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("events", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("message").ILike(keyword),
	))

	if fresh == "true" {
		pg.Where(pg.Col("fresh").Eq(true))
	} else if fresh == "false" {
		pg.Where(pg.Col("fresh").Eq(false))
	}
	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Event

	err = pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询事件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, h := range records {
		list = append(list, echo.Map{
			"uuid":      h.UUID,
			"create_at": h.CreateAt,
			"level":     h.Level,
			"title":     h.Title,
			"message":   h.Message,
			"fresh":     h.Fresh,
		})
	}
	freshCount := 0

	// 查询未读事件数
	ql := `select count(*) from events where fresh = true`

	if err = db.SelectOne(ql, &freshCount); err != nil {
		cc.ErrLog(err).Error("查询事件表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"count": count, "list": list, "fresh_count": freshCount,
	})
}
