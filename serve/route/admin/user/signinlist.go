package user

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/mssola/user_agent"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询登录历史
func signinlist(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	startAt := time.Now().AddDate(0, 0, -180)

	// 查询列表
	ql := `
		select * from signin_history where user_uuid = ? and create_at > ?
		order by create_at desc
	`
	var records []db.SigninHistory

	err := db.Select(ql, &records, user.UUID, startAt)
	if err != nil {
		cc.ErrLog(err).Error("查询用户登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, h := range records {
		ua := user_agent.New(h.UA)

		osinfo := ua.OSInfo()
		os := fmt.Sprintf("%s %s", osinfo.Name, osinfo.Version)

		name, version := ua.Browser()
		browser := fmt.Sprintf("%s %s", name, version)

		list = append(list, echo.Map{
			"create_at": h.CreateAt,
			"ip":        h.IP,
			"country":   h.Country,
			"province":  h.Province,
			"city":      h.City,
			"district":  h.District,
			"longitude": h.Longitude,
			"latitude":  h.Latitude,
			"os":        os,
			"browser":   browser,
			"acttype":   h.ActType,
			"oauthp":    h.OAuthP,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
