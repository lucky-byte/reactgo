package bulletin

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

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("bulletins", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("content").ILike(keyword),
	))
	pg.Where(pg.Col("is_public").IsTrue())
	pg.Where(pg.Col("status").Eq(3))

	pg.Select(pg.Col("*"))
	pg.OrderBy(pg.Col("send_time").Desc())

	var count uint
	var records []db.Bulletin

	err = pg.Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询公告列表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": records})
}
