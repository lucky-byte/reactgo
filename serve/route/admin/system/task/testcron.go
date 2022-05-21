package task

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"

	"github.com/lucky-byte/reactgo/serve/ctx"
)

// 验证 cron 表达式
func testcron(c echo.Context) error {
	cc := c.(*ctx.Context)

	exp := c.QueryParam("cron")
	if len(exp) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	cc.Trim(&exp)

	parser := cron.NewParser(
		cron.SecondOptional | cron.Minute | cron.Hour |
			cron.Dom | cron.Month | cron.Dow | cron.Descriptor,
	)
	if _, err := parser.Parse(exp); err != nil {
		cc.ErrLog(err).Error("解析 cron 表达式错")
		return c.String(http.StatusBadRequest, "表达式无效: "+err.Error())
	}
	return c.NoContent(http.StatusOK)
}
