package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/secure"
)

func passwd(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var oldPassword, newPassword string

	err := echo.FormFieldBinder(c).
		MustString("oldPassword", &oldPassword).
		MustString("newPassword", &newPassword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&oldPassword, &newPassword)

	// 验证原登录密码
	phc, err := secure.ParsePHC(user.Passwd)
	if err != nil {
		cc.ErrLog(err).Error("验证原密码失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	if err = phc.Verify(oldPassword); err != nil {
		cc.ErrLog(err).Error("验证原密码失败")
		return c.String(http.StatusForbidden, "原登录密码不匹配")
	}

	// 保存新密码
	passwdHash, err := secure.DefaultPHC().Hash(newPassword)
	if err != nil {
		cc.ErrLog(err).Error("加密新密码失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql := `
		update users set passwd = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, passwdHash, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改密码失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
