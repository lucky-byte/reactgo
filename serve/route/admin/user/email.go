package user

import (
	"net/http"
	"net/mail"

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
		return cc.BadRequest(err)
	}
	cc.Trim(&email)

	if _, err := mail.ParseAddress(email); err != nil {
		cc.ErrLog(err).Error("解析邮件地址错")
		return c.String(http.StatusBadRequest, "邮箱地址格式错误")
	}
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
