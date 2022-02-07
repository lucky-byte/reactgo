package notification

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询登录历史列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var page, rows_per_page uint
	var day int
	var keyword string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows_per_page", &rows_per_page).
		MustInt("day", &day).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	offset := page * rows_per_page
	startAt := time.Now().AddDate(0, 0, -day)
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))

	// 查询总数
	ql := `
		select count(*) from notifications
		where create_at > $1 and (title ilike $2 or message ilike $2)
	`
	var total int

	if err = db.SelectOne(ql, &total, startAt, keyword); err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询列表
	ql = `
		select * from notifications
		where create_at > $1 and (title ilike $2 or message ilike $2)
		order by create_at desc
		offset $3 limit $4
	`
	var records []db.Notification

	err = db.Select(ql, &records, startAt, keyword, offset, rows_per_page)
	if err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var notifications []echo.Map

	for _, h := range records {
		notifications = append(notifications, echo.Map{
			"create_at": h.CreateAt,
			"touser":    h.ToUser,
			"level":     h.Level,
			"title":     h.Title,
			"message":   h.Message,
			"fresh":     h.Fresh,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"total": total, "notifications": notifications,
	})
}
