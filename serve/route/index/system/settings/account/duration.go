package account

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 更新会话持续时间
func duration(c echo.Context) error {
	cc := c.(*ctx.Context)

	var duration int

	err := echo.FormFieldBinder(c).MustInt("duration", &duration).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update settings set token_duration = ?`

	if err = db.ExecOne(ql, duration); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
