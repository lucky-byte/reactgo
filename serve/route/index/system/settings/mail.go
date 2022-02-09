package settings

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/mail"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
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
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
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
		cc.ErrLog(err).Error("查询邮件传输代理配置错")
		return c.NoContent(http.StatusInternalServerError)
	}

	ql = `
		insert into mtas (
			uuid, name, host, port, ssl, sender, prefix, replyto,
			username, passwd, cc, bcc, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
		"sortno":   result.SortNo,
		"nsent":    result.NSent,
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
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
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
		cc.ErrLog(err).Error("请求参数不完整")
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

// 发送测试邮件
func mailTest(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid, address string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
		MustString("email", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
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
	// 生成邮件
	m, err := mailfs.Message("测试邮件", "test", map[string]interface{}{
		"MTAName": mta.Name,
	})
	if err != nil {
		cc.ErrLog(err).Error("从模板生成邮件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	m.AddTO(addr)

	// 发送邮件
	if err = m.SendWithMta(&mta); err != nil {
		cc.ErrLog(err).Error("发送邮件错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}

// 导出
func mailExport(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from mtas order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var mtas []map[string]interface{}

	for _, v := range result {
		mtas = append(mtas, map[string]interface{}{
			"name":     v.Name,
			"host":     v.Host,
			"port":     v.Port,
			"ssl":      v.SSL,
			"sender":   v.Sender,
			"replyto":  v.ReplyTo,
			"username": v.Username,
			"passwd":   v.Passwd,
			"cc":       v.CC,
			"bcc":      v.BCC,
			"prefix":   v.Prefix,
			"sortno":   v.SortNo,
			"nsent":    v.NSent,
		})
	}
	b, err := json.Marshal(mtas)
	if err != nil {
		cc.ErrLog(err).Error("json marshal 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return cc.Download(b, "mail-config.json")
}

// 导入
func mailImport(c echo.Context) error {
	cc := c.(*ctx.Context)

	file, err := c.FormFile("file")
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	f, err := file.Open()
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	defer f.Close()

	b, err := io.ReadAll(f)
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	var result []db.MTA

	if err = json.Unmarshal(b, &result); err != nil {
		cc.ErrLog(err).Error("解析上传文件错")
		return c.String(http.StatusBadRequest, "解析文件错")
	}
	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("启动数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询最大 sortno
	ql := `select coalesce(max(sortno), 0) from mtas`
	var sortno int

	if err := tx.Get(&sortno, tx.Rebind(ql)); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		tx.Rollback()
		return c.NoContent(http.StatusInternalServerError)
	}
	for i, v := range result {
		if len(v.Name) == 0 || len(v.Host) == 0 || v.Port == 0 || len(v.Sender) == 0 {
			tx.Rollback()
			return c.String(http.StatusBadRequest, fmt.Sprintf(
				"第 %d 条记录不完整，缺少 name, host, port 或者 sender", i,
			))
		}
		// 检查名称是否存在
		ql := `select count(*) from mtas where name = ?`
		var count int

		if err := tx.Get(&count, tx.Rebind(ql), v.Name); err != nil {
			cc.ErrLog(err).Error("查询邮件配置错")
			tx.Rollback()
			return c.NoContent(http.StatusInternalServerError)
		}
		// 如果存在则忽略
		if count > 0 {
			continue
		}
		// 添加记录
		ql = `
			insert into mtas (
				uuid, name, host, port, ssl, sender, replyto, username, passwd,
				cc, bcc, prefix, nsent, sortno
			) values (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`
		_, err = tx.Exec(tx.Rebind(ql), uuid.NewString(),
			v.Name, v.Host, v.Port, v.SSL, v.Sender, v.ReplyTo,
			v.Username, v.Passwd, v.CC, v.BCC, v.Prefix, v.NSent, sortno+1,
		)
		if err != nil {
			cc.ErrLog(err).Error("添加邮件配置错")
			tx.Rollback()
			return c.NoContent(http.StatusInternalServerError)
		}
		sortno += 1
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
