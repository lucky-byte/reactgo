package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/secure"
)

func passwd(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var oldPassword, newPassword string

	err := echo.FormFieldBinder(c).
		MustString("oldPassword", &oldPassword).
		MustString("newPassword", &newPassword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}

	// 验证原登录密码
	phc, err := secure.ParsePHC(user.Passwd)
	if err != nil {
		cc.ErrLog(err).Error("修改密码失败")
		return c.String(http.StatusForbidden, "修改密码失败")
	}
	if err = phc.Verify(oldPassword); err != nil {
		cc.ErrLog(err).Error("修改密码失败")
		return c.String(http.StatusForbidden, "原登录密码不匹配")
	}

	// 保存新密码
	passwdHash, err := secure.DefaultPHC().Hash(newPassword)
	if err != nil {
		cc.ErrLog(err).Error("修改密码失败")
		return c.String(http.StatusForbidden, "修改密码失败")
	}
	ql := `update users set passwd = ? where uuid = ?`

	if err = db.ExecOne(ql, passwdHash, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改密码失败")
		return c.String(http.StatusForbidden, "修改密码失败")
	}
	return c.NoContent(http.StatusOK)
}