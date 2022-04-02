package resetpass

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v4"
	"github.com/sethvargo/go-password/password"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/secure"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 重新发送短信验证码
func smsResend(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mobile, username string

	err := echo.FormFieldBinder(c).
		MustString("mobile", &mobile).MustString("username", &username).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 检查用户信息
	ql := `select count(*) from users where userid = ? and mobile = ?`
	var count int

	if err = db.SelectOne(ql, &count, username, mobile); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	// 发送验证码
	smsid, err := sms.SendCode(mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码失败")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, echo.Map{"smsid": smsid})
}

// 验证短信验证码
func smsVerify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, mobile, smsid, code string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).
		MustString("mobile", &mobile).
		MustString("smsid", &smsid).
		MustString("code", &code).BindError()
	if err != nil {
		c.String(http.StatusBadRequest, "请求数据不完整")
	}

	// 验证短信验证码
	err = sms.VerifyCode(smsid, code, mobile)
	if err != nil {
		cc.ErrLog(err).WithField("mobile", mobile).
			Errorf("用户 %s 验证短信验证码失败", username)
		return c.String(http.StatusBadRequest, err.Error())
	}
	// 查询用户信息
	ql := `select * from users where userid = ? and mobile = ?`
	var user db.User

	if err = db.SelectOne(ql, &user, username, mobile); err != nil {
		cc.ErrLog(err).Errorf("查询用户 %s(%s) 信息错", username, mobile)
		return c.NoContent(http.StatusInternalServerError)
	}
	// 生成新密码
	passwd := password.MustGenerate(20, 6, 0, false, true)

	// 密码加密
	passwdHash, err := secure.DefaultPHC().Hash(passwd)
	if err != nil {
		cc.ErrLog(err).Error("加密密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新用户密码
	ql = `update users set passwd = ? where userid = ? and mobile = ?`

	if err = db.ExecOne(ql, passwdHash, username, mobile); err != nil {
		cc.ErrLog(err).Error("更新用户密码失败")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 生成邮件
	m, err := mailfs.Message("请查收新密码", "resetpass", map[string]interface{}{
		"name":     user.Name,
		"password": passwd,
	})
	if err != nil {
		cc.ErrLog(err).Error("创建密码重置邮件错")
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
		cc.ErrLog(err).Errorf("发送邮件到 %s 失败", user.Email)
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
