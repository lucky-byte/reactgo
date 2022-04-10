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

	userTable := goqu.T("users")

	pg.Join(userTable, goqu.On(pg.Col("user_uuid").Eq(userTable.Col("uuid"))))

	pg.Where(goqu.Or(
		pg.Col("title").ILike(keyword), pg.Col("content").ILike(keyword),
	))
	pg.Where(pg.Col("create_at").Gt(startAt))

	pg.Select(pg.Col("*"),
		userTable.Col("name").As("user_name"),
		userTable.Col("userid").As("userid"),
	)
	pg.OrderBy(pg.Col("create_at").Desc())

	type record struct {
		db.Bulletin
		UserName string `db:"user_name"`
		Userid   string `db:"userid"`
	}
	var count uint
	var records []record

	if err = pg.Exec(&count, &records); err != nil {
		cc.ErrLog(err).Error("查询公告列表错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, r := range records {
		ntargets, nreaders := 0, 0

		if len(r.Targets) > 0 {
			ntargets = len(strings.Split(r.Targets, ","))
		}
		if len(r.Readers) > 0 {
			nreaders = len(strings.Split(r.Readers, ","))
		}

		list = append(list, echo.Map{
			"uuid":      r.UUID,
			"create_at": r.CreateAt,
			"title":     r.Title,
			"content":   r.Content,
			"send_time": r.SendTime,
			"user_name": r.UserName,
			"userid":    r.Userid,
			"ntargets":  ntargets,
			"nreaders":  nreaders,
			"status":    r.Status,
			"deleted":   r.Deleted,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
