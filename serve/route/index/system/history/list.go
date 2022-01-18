package history

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mssola/user_agent"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
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
		select count(*) from signin_history
		where create_at > $1 and (
			userid ilike $2 or name ilike $2 or ua ilike $2
		)
	`
	var total int

	if err = db.SelectOne(ql, &total, startAt, keyword); err != nil {
		cc.ErrLog(err).Error("查询登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询列表
	ql = `
		select create_at, userid, name, ip, city, ua from signin_history
		where create_at > $1 and (
			userid ilike $2 or name ilike $2 or ua ilike $2
		)
		order by create_at desc
		offset $3 limit $4
	`
	var records []db.SigninHistory

	err = db.Select(ql, &records, startAt, keyword, offset, rows_per_page)
	if err != nil {
		cc.ErrLog(err).Error("查询用户登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var history []echo.Map

	for _, h := range records {
		ua := user_agent.New(h.UA) // parse useragent string

		osinfo := ua.OSInfo()
		os := fmt.Sprintf("%s %s", osinfo.Name, osinfo.Version)

		name, version := ua.Browser()
		browser := fmt.Sprintf("%s %s", name, version)

		history = append(history, echo.Map{
			"create_at": h.CreateAt,
			"userid":    h.UserId,
			"name":      h.Name,
			"ip":        h.IP,
			"city":      h.City.String,
			"os":        os,
			"browser":   browser,
			"is_mobile": ua.Mobile(),
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"total": total, "history": history})
}
