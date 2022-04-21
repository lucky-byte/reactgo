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
	var keyword, date string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		String("date", &date).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("bulletins", offset, rows)

	userTable := goqu.T("users")

	pg.Join(userTable, goqu.On(pg.Col("user_uuid").Eq(userTable.Col("uuid"))))

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("content").ILike(keyword),
	))
	if len(date) > 0 {
		pg.Where(goqu.L("date(bulletins.create_at)").Eq(date))
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
