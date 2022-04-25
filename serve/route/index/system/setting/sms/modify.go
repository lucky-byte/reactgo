package sms

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改邮件传输代理
func modify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid, name, host, sender, username, password, prefix, replyto, ccc, bcc string
	var port int
	var sslmode bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
		MustString("name", &name).
		MustString("host", &host).
		MustInt("port", &port).
		MustBool("sslmode", &sslmode).
		MustString("sender", &sender).
		String("password", &password).
		String("username", &username).
		String("prefix", &prefix).
		String("replyto", &replyto).
		String("cc", &ccc).
		String("bcc", &bcc).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&name, &host, &sender, &username, &prefix, &replyto, &ccc, &bcc)

	// 检查地址格式
	if _, err = mail.ParseAddress(sender); err != nil {
		cc.ErrLog(err).Errorf("解析发件人地址(%s)错误", sender)
		return c.String(http.StatusBadRequest, "发件人地址错误")
	}
	if len(replyto) > 0 {
		if _, err = mail.ParseAddress(replyto); err != nil {
			cc.ErrLog(err).Errorf("解析回复地址(%s)错误", replyto)
			return c.String(http.StatusBadRequest, "回复地址错误")
		}
	}
	ql := `
		update mtas set
			name = ?, host = ?, port = ?, sslmode = ?, sender = ?,
			prefix = ?, replyto = ?, username = ?, passwd = ?,
			cc = ?, bcc = ?
		where uuid = ?
	`
	err = db.ExecOne(ql,
		name, host, port, sslmode, sender, prefix, replyto, username, password,
		ccc, bcc, mta_uuid,
	)
	if err != nil {
		cc.ErrLog(err).Error("更新邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
