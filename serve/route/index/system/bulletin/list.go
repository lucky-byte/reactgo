package bulletin

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

	var page, rows uint
	var days int
	var keyword string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustInt("days", &days).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	startAt := time.Now().AddDate(0, 0, -days)
	offset := page * rows

	pg := db.NewPagination("bulletins", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("content").ILike(keyword),
	))
	pg.Where(pg.Col("create_at").Gt(startAt))

	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Bulletin

	err = pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询公告列表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, r := range records {
		targets := strings.Split(r.Targets, ",")
		readers := strings.Split(r.Readers, ",")

		list = append(list, echo.Map{
			"uuid":      r.UUID,
			"create_at": r.CreateAt,
			"expiry_at": r.ExpiryAt,
			"title":     r.Title,
			"content":   r.Content,
			"draft":     r.Draft,
			"ntargets":  len(targets),
			"nreaders":  len(readers),
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
