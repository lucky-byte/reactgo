package generic

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 允许报告错误
func bugreport(c echo.Context) error {
	cc := c.(*ctx.Context)

	var bugreport bool

	err := echo.FormFieldBinder(c).MustBool("bugreport", &bugreport).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update settings set bugreport = ?`

	if err = db.ExecOne(ql, bugreport); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
