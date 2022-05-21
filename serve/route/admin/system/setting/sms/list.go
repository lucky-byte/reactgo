package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询短信服务列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from smss order by sortno`
	var list []db.SMS

	if err := db.Select(ql, &list); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
