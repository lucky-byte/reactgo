package setting

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 设置是否允许浏览器通知
func browser(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var enable bool

	err := echo.FormFieldBinder(c).MustBool("enable", &enable).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update users set noti_browser = ? where uuid = ?`

	err = db.ExecOne(ql, enable, user.UUID)
	if err != nil {
		cc.ErrLog(err).Error("更新通知设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
