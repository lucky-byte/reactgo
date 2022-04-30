package user

import (
	"fmt"
	"net/http"
	"net/mail"
	"regexp"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/secure"
)

func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var userid, name, password, mobile, email, idno, address, acl string
	var sendmail, tfa bool

	err := echo.FormFieldBinder(c).
		MustString("userid", &userid).
		MustString("name", &name).
		MustString("password", &password).
		MustString("mobile", &mobile).
		MustString("email", &email).
		String("idno", &idno).
		Bool("sendmail", &sendmail).
		Bool("tfa", &tfa).
		MustString("acl", &acl).
		String("address", &address).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&userid, &name, &password, &email, &idno, &mobile, &address)

	// 验证数据
	if !regexp.MustCompile(`^1[0-9]{10}$`).MatchString(mobile) {
		return c.String(http.StatusBadRequest, "手机号格式错误")
	}
	if _, err = mail.ParseAddress(email); err != nil {
		cc.ErrLog(err).Error("解析邮箱地址错")
		return c.String(http.StatusBadRequest, "邮箱地址格式错误")
	}
	if len(idno) > 0 {
		if !regexp.MustCompile(`^[0-9]{17}[0-9xX]$`).MatchString(idno) {
			return c.String(http.StatusBadRequest, "身份证号格式错误")
		}
	}
	// 查询 userid 是否冲突
	ql := `select count(*) from users where userid = ?`
	var count int

	if err := db.SelectOne(ql, &count, userid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("%s 已存在", userid))
	}

	// 添加用户
	passwdHash, err := secure.DefaultPHC().Hash(password)
	if err != nil {
		cc.ErrLog(err).Error("加密密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `
		insert into users (
			uuid, userid, passwd, name, mobile, email, idno, address, tfa, acl
		)
		values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(
		ql, uuid.NewString(), userid, passwdHash,
		name, mobile, email, idno, address, tfa, acl,
	)
	if err != nil {
		cc.ErrLog(err).Error("添加用户错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 将登录信息发送到用户邮箱
	if sendmail {
		m, err := mailfs.Message("登录信息", "signin", map[string]interface{}{
			"name":     name,
			"userid":   userid,
			"password": password,
			"url":      cc.Config().ServerHttpURL(),
		})
		if err != nil {
			cc.ErrLog(err).Error("创建邮件错")
			return c.NoContent(http.StatusInternalServerError)
		}
		addr, err := mail.ParseAddress(email)
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
