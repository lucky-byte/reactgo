package user

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/secure"
)

func passwd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, password string
	var sendmail bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("password", &password).
		MustBool("sendmail", &sendmail).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&password)

	// 检查是否可修改
	user, err := isUpdatable(uuid)
	if err != nil {
		cc.ErrLog(err).Error("修改用户密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新信息
	passwdHash, err := secure.DefaultPHC().Hash(password)
	if err != nil {
		cc.ErrLog(err).Error("加密密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql := `
		update users set passwd = ?, update_at = current_timestamp
		where uuid = ? and disabled = false and deleted = false
	`
	err = db.ExecOne(ql, passwdHash, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 发送邮件
	if sendmail {
		m, err := mailfs.Message("请查收新密码", "resetpass", map[string]interface{}{
			"name":     user.Name,
			"password": password,
		})
		if err != nil {
			cc.ErrLog(err).Error("创建邮件错")
			return c.NoContent(http.StatusInternalServerError)
		}
		addr, err := mail.ParseAddress(user.Email)
		if err != nil {
			cc.ErrLog(err).Error("解析用户邮箱错")
			return c.NoContent(http.StatusInternalServerError)
		}
		m.AddTO(addr)

		// 发送邮件
		if err = m.Send(); err != nil {
			cc.ErrLog(err).Error("发送邮件错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	return c.NoContent(http.StatusOK)
}
