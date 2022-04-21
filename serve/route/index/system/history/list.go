package history

import (
	"fmt"
	"net/http"
	"strings"

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

	pg := db.NewPagination("signin_history", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("userid").ILike(keyword), pg.Col("name").ILike(keyword),
	))
	if len(date) > 0 {
		pg.Where(goqu.L("date(create_at)").Eq(date))
	}
	pg.OrderBy(pg.Col("create_at").Desc())

	var count uint
	var records []db.SigninHistory

	err = pg.Select(pg.Col("*")).Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, h := range records {
		ua := user_agent.New(h.UA) // parse useragent string

		osinfo := ua.OSInfo()
		os := fmt.Sprintf("%s %s", osinfo.Name, osinfo.Version)

		name, version := ua.Browser()
		browser := fmt.Sprintf("%s %s", name, version)

		list = append(list, echo.Map{
			"create_at": h.CreateAt,
			"userid":    h.UserId,
			"name":      h.Name,
			"ip":        h.IP,
			"country":   h.Country,
			"province":  h.Province,
			"city":      h.City,
			"district":  h.District,
			"longitude": h.Longitude,
			"latitude":  h.Latitude,
			"os":        os,
			"browser":   browser,
			"is_mobile": ua.Mobile(),
			"trust":     h.Trust,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
