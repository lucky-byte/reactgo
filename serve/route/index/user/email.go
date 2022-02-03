package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func email(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var email string

	err := echo.FormFieldBinder(c).MustString("email", &email).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	cc.Trim(&email)

	ql := `
		update users set email = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, email, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改用户邮箱地址失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
