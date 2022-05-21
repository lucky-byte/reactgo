package user

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mssola/user_agent"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询访问设备
func devices(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	ql := `select distinct ua from signin_history where user_uuid = ?`
	var records []string

	if err := db.Select(ql, &records, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询访问设备错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var result []map[string]interface{}

	derepeat := make(map[string]bool)

	for _, s := range records {
		ua := user_agent.New(s)

		osinfo := ua.OSInfo()
		browser, _ := ua.Browser()

		// 以操作系统和浏览器类型组合去重复
		if _, ok := derepeat[osinfo.Name+browser]; ok {
			continue
		}
		derepeat[osinfo.Name+browser] = true

		result = append(result, map[string]interface{}{
			"os":      osinfo.Name,
			"browser": browser,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"devices": result})
}
