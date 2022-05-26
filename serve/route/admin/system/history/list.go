package history

import (
	"fmt"
	"net/http"
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

	pg := db.NewPagination("signin_history", offset, rows)

	if len(keyword) > 0 {
		pg.Where(goqu.Or(
			pg.Col("userid").ILike(search), pg.Col("name").ILike(search),
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
			"tfa":       h.TFA,
			"acttype":   h.ActType,
			"oauthp":    h.OAuthP,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
