package bulletin

import (
	"fmt"
	"net/http"
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
	var keyword, date string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		String("date", &date).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&keyword, &date)

	search := fmt.Sprintf("%%%s%%", keyword)
	offset := page * rows

	pg := db.NewPagination("bulletins", offset, rows)

	userTable := goqu.T("users")

	pg.Join(userTable, goqu.On(pg.Col("user_uuid").Eq(userTable.Col("uuid"))))

	if len(keyword) > 0 {
		pg.Where(goqu.Or(
			pg.Col("title").ILike(search), pg.Col("content").ILike(search),
		))
	}
	if len(date) > 0 {
		t, err := db.ParseDate(date)
		if err != nil {
			cc.ErrLog(err).Error("解析上传日期错")
			return c.NoContent(http.StatusInternalServerError)
		}
		te := t.AddDate(0, 0, 1).Add(-time.Millisecond)

		pg.Where(pg.Col("create_at").Between(db.TimeRange(t, te)))
	}
	pg.Select(pg.Col("*"),
		userTable.Col("name").As("user_name"),
		userTable.Col("userid").As("userid"),
	)
	pg.OrderBy(pg.Col("create_at").Desc())

	type record struct {
		db.Bulletin
		UserName string `db:"user_name" json:"user_name"`
		Userid   string `db:"userid"    json:"userid"`
	}
	var count uint
	var records []record

	if err = pg.Exec(&count, &records); err != nil {
		cc.ErrLog(err).Error("查询公告列表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": records})
}
