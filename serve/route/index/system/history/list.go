package history

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/labstack/echo/v4"
	"github.com/mssola/user_agent"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询登录历史列表
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
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	startAt := time.Now().AddDate(0, 0, -days)
	offset := page * rows

	pg := db.NewPagination("signin_history", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("userid").ILike(keyword), pg.Col("name").ILike(keyword),
	))
	pg.Where(pg.Col("create_at").Gt(startAt))

	var count uint
	var records []db.SigninHistory

	err = pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询登录历史信息错")
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
	return c.JSON(http.StatusOK, echo.Map{"count": count, "history": history})
}
