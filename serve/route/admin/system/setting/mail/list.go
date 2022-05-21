package mail

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询邮件 MTA 列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from mtas order by sortno`
	var list []db.MTA

	if err := db.Select(ql, &list); err != nil {
		cc.ErrLog(err).Error("查询邮件服务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
