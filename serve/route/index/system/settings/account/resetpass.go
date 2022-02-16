package account

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 允许找回密码
func resetpass(c echo.Context) error {
	cc := c.(*ctx.Context)

	var resetpass bool

	err := echo.FormFieldBinder(c).MustBool("resetpass", &resetpass).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update settings set resetpass = ?`

	if err = db.ExecOne(ql, resetpass); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
