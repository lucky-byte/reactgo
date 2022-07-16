package debug

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func get(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select debug from debug limit 1`
	var debug bool

	if err := db.SelectOne(ql, &debug); err != nil {
		cc.ErrLog(err).Error("查询 Debug 信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"debug": debug})
}
