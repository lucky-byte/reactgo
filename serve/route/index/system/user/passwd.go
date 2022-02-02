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
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	// 删除前后空白字符
	cc.Trim(&password)

	// 更新信息
	passwdHash, err := secure.DefaultPHC().Hash(password)
	if err != nil {
		cc.ErrLog(err).Error("加密密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql := `
		update users set passwd = ?, update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, passwdHash, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}

	if sendmail {
		// 查询用户信息，用于发送邮件
		ql = `select * from users where uuid = ?`
		var user db.User

		if err = db.SelectOne(ql, &user, uuid); err != nil {
			cc.ErrLog(err).Error("查询用户信息错")
			return c.NoContent(http.StatusInternalServerError)
		}
		// 生成邮件
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
