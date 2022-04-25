package mail

import (
	"net/http"
	"net/mail"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加邮件传输代理
func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var name, host, sender, username, password, prefix, replyto, ccc, bcc string
	var port int
	var sslmode bool

	err := echo.FormFieldBinder(c).
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
	ql := `select coalesce(max(sortno), 0) from mtas`
	sortno := 0

	if err = db.SelectOne(ql, &sortno); err != nil {
		cc.ErrLog(err).Error("查询邮件服务配置错")
		return c.NoContent(http.StatusInternalServerError)
	}

	ql = `
		insert into mtas (
			uuid, name, host, port, sslmode, sender, prefix, replyto,
			username, passwd, cc, bcc, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
		)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		name, host, port, sslmode, sender, prefix, replyto,
		username, password, ccc, bcc, sortno+1,
	)
	if err != nil {
		cc.ErrLog(err).Error("添加邮件服务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
