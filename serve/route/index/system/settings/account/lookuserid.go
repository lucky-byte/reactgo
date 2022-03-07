package account

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 允许找回登录名
func lookuserid(c echo.Context) error {
	cc := c.(*ctx.Context)

	var lookUserid bool

	err := echo.FormFieldBinder(c).MustBool("lookuserid", &lookUserid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update settings set lookuserid = ?`

	if err = db.ExecOne(ql, lookUserid); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
