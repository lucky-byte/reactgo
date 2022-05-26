package event

import (
	"fmt"
	"net/http"

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
	cc.Trim(&keyword, &fresh)

	search := fmt.Sprintf("%%%s%%", keyword)
	offset := page * rows

	pg := db.NewPagination("events", offset, rows)

	if len(keyword) > 0 {
		pg.Where(goqu.Or(
			pg.Col("title").ILike(search), pg.Col("message").ILike(search),
		))
	}
	if fresh == "true" {
		pg.Where(pg.Col("fresh").Eq(true))
	} else if fresh == "false" {
		pg.Where(pg.Col("fresh").Eq(false))
	}
	pg.Where(pg.Col("level").Gte(level))

	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var list []db.Event

	err = pg.Select(pg.Col("*")).Exec(&count, &list)
	if err != nil {
		cc.ErrLog(err).Error("查询事件错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 查询未读事件数
	ql := `select count(*) from events where fresh = true and level >= ?`
	freshCount := 0

	err = db.SelectOne(ql, &freshCount, level)
	if err != nil {
		cc.ErrLog(err).Error("查询事件表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"count": count, "list": list, "fresh_count": freshCount,
	})
}
