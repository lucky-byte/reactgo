package settings

import (
	"net/http"
	"net/mail"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

// 查询邮件服务配置
func mailConfig(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from settings`
	var setting db.Setting

	if err := db.SelectOne(ql, &setting); err != nil {
		cc.ErrLog(err).Error("查询系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `select * from mtas order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var mtas []echo.Map

	for _, v := range result {
		mtas = append(mtas, echo.Map{
			"uuid":   v.UUID,
			"name":   v.Name,
			"host":   v.Host,
			"port":   v.Port,
			"ssl":    v.SSL,
			"sender": v.Sender,
			"sortno": v.SortNo,
			"nsent":  v.NSent,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"mail_prefix": setting.MailPrefix,
		"mtas":        mtas,
	})
}

// 修改标题前缀
func mailPrefix(c echo.Context) error {
	cc := c.(*ctx.Context)

	var prefix string

	err := echo.FormFieldBinder(c).String("prefix", &prefix).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update settings set mail_prefix = ?`

	if err = db.ExecOne(ql, prefix); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
	}
	return c.NoContent(http.StatusOK)
}

// 添加邮件传输代理
func mailAdd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var name, host, sender, username, password, replyto, ccc, bcc string
	var port int
	var ssl bool

	err := echo.FormFieldBinder(c).
		MustString("name", &name).
		MustString("host", &host).
		MustInt("port", &port).
		MustBool("ssl", &ssl).
		MustString("sender", &sender).
		MustString("password", &password).
		String("username", &username).
		String("replyto", &replyto).
		String("cc", &ccc).
		String("bcc", &bcc).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
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
		cc.ErrLog(err).Error("查询邮件传输代理配置错")
		return c.NoContent(http.StatusInternalServerError)
	}

	ql = `
		insert into mtas (
			uuid, name, host, port, ssl, sender, replyto, username, passwd,
			cc, bcc, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
		)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		name, host, port, ssl, sender, replyto, username, password,
		ccc, bcc, sortno+1,
	)
	if err != nil {
		cc.ErrLog(err).Error("添加邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 删除邮件传输代理
func mailDel(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `delete from mtas where uuid = ?`

	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除邮件传输代理错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 查询邮件传输代理信息
func mailInfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from mtas where uuid = ?`
	var result db.MTA

	if err := db.SelectOne(ql, &result, uuid); err != nil {
		cc.ErrLog(err).Error("查询邮件传输代理错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":     result.UUID,
		"name":     result.Name,
		"host":     result.Host,
		"port":     result.Port,
		"ssl":      result.SSL,
		"sender":   result.Sender,
		"replyto":  result.ReplyTo,
		"username": result.Username,
		"passwd":   result.Passwd,
		"cc":       result.CC,
		"bcc":      result.BCC,
	})
}

// 修改邮件传输代理
func mailModify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid2, name, host, sender, username, password, replyto, ccc, bcc string
	var port int
	var ssl bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid2).
		MustString("name", &name).
		MustString("host", &host).
		MustInt("port", &port).
		MustBool("ssl", &ssl).
		MustString("sender", &sender).
		MustString("password", &password).
		String("username", &username).
		String("replyto", &replyto).
		String("cc", &ccc).
		String("bcc", &bcc).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
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
			name = ?, host = ?, port = ?, ssl = ?, sender = ?,
			replyto = ?, username = ?, passwd = ?,
			cc = ?, bcc = ?
		where uuid = ?
	`
	err = db.ExecOne(ql,
		name, host, port, ssl, sender, replyto, username, password,
		ccc, bcc, uuid2,
	)
	if err != nil {
		cc.ErrLog(err).Error("更新邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 排序
func mailSort(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid2, dir string
	var sortno int

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid2).
		MustString("dir", &dir).
		MustInt("sortno", &sortno).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 移到最前
	if dir == "top" {
		ql := `
			update mtas set sortno = (select min(sortno) from mtas) - 1
			where uuid = ?
		`
		if err = db.ExecOne(ql, uuid2); err != nil {
			cc.ErrLog(err).Error("排序错误")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}
	// 移到最后
	if dir == "bottom" {
		ql := `
			update mtas set sortno = (select max(sortno) from mtas) + 1
			where uuid = ?
		`
		if err = db.ExecOne(ql, uuid2); err != nil {
			cc.ErrLog(err).Error("排序错误")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}
	return c.String(http.StatusBadRequest, "操作无效")
}
