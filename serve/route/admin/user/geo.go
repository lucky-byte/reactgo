package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询访问位置
func geo(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	ql := `
		select country, province, city,
			avg(longitude) as longitude, avg(latitude) as latitude
		from signin_history
		where user_uuid = ? and longitude <> 0 and latitude <> 0
		group by country, province, city
	`
	var records []db.SigninHistory

	if err := db.Select(ql, &records, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询登录历史错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var result []map[string]interface{}

	derepeat := make(map[string]bool)

	for _, s := range records {
		name := s.Country

		if s.Country != s.Province {
			name += s.Province
		}
		if s.City != s.Province && s.City != s.Country {
			name += s.City
		}
		if len(name) == 0 {
			continue
		}
		// 以国家省市区去重复
		if v, ok := derepeat[name]; ok && v {
			continue
		}
		derepeat[name] = true

		result = append(result, map[string]interface{}{
			"name":      name,
			"longitude": s.Longitude,
			"latitude":  s.Latitude,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"geo": result})
}
