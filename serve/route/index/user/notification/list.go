package notification

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
	user := cc.User()

	var level, page, rows uint
	var keyword, fresh string

	err := echo.FormFieldBinder(c).
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

	pg := db.NewPagination("notifications", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("content").ILike(keyword),
	))
	pg.Where(pg.Col("user_uuid").Eq(user.UUID))

	// pg.Where(pg.Col("create_at").Gt(startAt), pg.Col("level").Gte(level))

	// if fresh == "true" {
	// 	pg.Where(pg.Col("fresh").Eq(true))
	// } else if fresh == "false" {
	// 	pg.Where(pg.Col("fresh").Eq(false))
	// }
	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.Notification

	err = pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, n := range records {
		list = append(list, echo.Map{
			"uuid":      n.UUID,
			"create_at": n.CreateAt,
			"type":      n.Type,
			"title":     n.Title,
			"content":   n.Content,
			"status":    n.Status,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
