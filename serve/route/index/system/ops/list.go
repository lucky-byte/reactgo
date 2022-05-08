package ops

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
	var keyword, method, date string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustString("method", &method).
		String("date", &date).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("ops", offset, rows)

	userTable := goqu.T("users")
	pg.Join(userTable, goqu.On(userTable.Col("uuid").Eq(pg.Col("user_uuid"))))

	pg.Where(goqu.Or(
		pg.Col("url").ILike(keyword),
		pg.Col("body").ILike(keyword),
		pg.Col("audit").ILike(keyword),
	))
	if strings.ToUpper(method) != "ALL" {
		pg.Where(pg.Col("method").Eq(strings.ToUpper(method)))
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
		db.Ops
		UserName string `db:"user_name" json:"user_name"`
		Userid   string `db:"userid"    json:"userid"`
	}
	var count uint
	var list []record

	err = pg.Exec(&count, &list)
	if err != nil {
		cc.ErrLog(err).Error("查询操作记录信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
