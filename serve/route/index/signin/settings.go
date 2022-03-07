package signin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询设置
func settings(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from settings`
	var settings db.Setting

	if err := db.SelectOne(ql, &settings); err != nil {
		cc.ErrLog(err).Error("查询设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"lookuserid": settings.LookUserid,
		"resetpass":  settings.ResetPass,
	})
}
