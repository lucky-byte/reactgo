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

	var Type, status, page, rows uint
	var keyword string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustUint("type", &Type).
		MustUint("status", &status).
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

	if Type > 0 {
		pg.Where(pg.Col("type").Eq(Type))
	}
	if status > 0 {
		pg.Where(pg.Col("status").Eq(status))
	}
	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var list []db.Notification

	err = pg.Select(pg.Col("*")).Exec(&count, &list)
	if err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询未读数量
	ql := `select count(*) from notifications where status = 1 and user_uuid = ?`
	var unread int

	if err = db.SelectOne(ql, &unread, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"count": count, "list": list, "unread": unread,
	})
}
