package settings

import (
	"net/http"
	"net/mail"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/email"
)

// 查询邮件服务配置
func mailConfig(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from mtas order by sortno`
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
	return c.JSON(http.StatusOK, echo.Map{"mtas": mtas})
}

// 添加邮件传输代理
func mailAdd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var name, host, sender, username, password, prefix, replyto, ccc, bcc string
	var port int
	var ssl bool

	err := echo.FormFieldBinder(c).
		MustString("name", &name).
		MustString("host", &host).
		MustInt("port", &port).
		MustBool("ssl", &ssl).
		MustString("sender", &sender).
		String("password", &password).
		String("username", &username).
		String("prefix", &prefix).
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
			uuid, name, host, port, ssl, sender, prefix, replyto,
			username, passwd, cc, bcc, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
		)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		name, host, port, ssl, sender, prefix, replyto,
		username, password, ccc, bcc, sortno+1,
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

	var mta_uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &mta_uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `delete from mtas where uuid = ?`

	if err := db.ExecOne(ql, mta_uuid); err != nil {
		cc.ErrLog(err).Error("删除邮件传输代理错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 查询邮件传输代理信息
func mailInfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &mta_uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from mtas where uuid = ?`
	var result db.MTA

	if err := db.SelectOne(ql, &result, mta_uuid); err != nil {
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
		"prefix":   result.Prefix,
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

	var mta_uuid, name, host, sender, username, password, prefix, replyto, ccc, bcc string
	var port int
	var ssl bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
		MustString("name", &name).
		MustString("host", &host).
		MustInt("port", &port).
		MustBool("ssl", &ssl).
		MustString("sender", &sender).
		String("password", &password).
		String("username", &username).
		String("prefix", &prefix).
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
			prefix = ?, replyto = ?, username = ?, passwd = ?,
			cc = ?, bcc = ?
		where uuid = ?
	`
	err = db.ExecOne(ql,
		name, host, port, ssl, sender, prefix, replyto, username, password,
		ccc, bcc, mta_uuid,
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

	var mta_uuid, dir string
	var sortno int

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
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
		if err = db.ExecOne(ql, mta_uuid); err != nil {
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
		if err = db.ExecOne(ql, mta_uuid); err != nil {
			cc.ErrLog(err).Error("排序错误")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}
	return c.String(http.StatusBadRequest, "操作无效")
}

// 测试
func mailTest(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid, address string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
		MustString("email", &address).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 解析收件地址
	addr, err := mail.ParseAddress(address)
	if err != nil {
		cc.ErrLog(err).Error("解析邮件地址错")
		return c.String(http.StatusBadRequest, "解析邮件地址错")
	}
	// 查询 MTA 信息
	ql := `select * from mtas where uuid = ?`
	var mta db.MTA

	if err = db.SelectOne(ql, &mta, mta_uuid); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 构造邮件
	m := email.TextMessage("测试邮件", "这是一封测试邮件，成功接收表明服务器配置正确。")
	m.AddTO(addr)

	// 发送邮件
	if err = m.SendWithMta(&mta); err != nil {
		cc.ErrLog(err).Error("发送邮件错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
