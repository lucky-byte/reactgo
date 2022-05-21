package resetpass

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 验证邮箱验证码
func emailverify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, email, code, id string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).
		MustString("email", &email).
		MustString("code", &code).MustString("id", &id).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&username, &email)

	// 查询用户信息
	ql := `select * from users where userid = ? and email = ?`
	var user db.User

	if err = db.SelectOne(ql, &user, username, email); err != nil {
		cc.ErrLog(err).Errorf("查询用户 %s(%s) 信息错", username, email)
		return c.String(http.StatusBadRequest, "未查询到用户信息")
	}
	// 比对验证码
	if err = mailfs.VerifyCode(id, code, email); err != nil {
		cc.ErrLog(err).Errorf("用户 %s(%s) 验证邮件验证码失败", username, email)
		return c.String(http.StatusBadRequest, "验证失败")
	}

	// 发送短信验证码
	smsid, err := sms.SendCode(user.Mobile)
	if err != nil {
		cc.ErrLog(err).Errorf("发送短信验证码到 %s 失败", user.Mobile)
		return c.String(http.StatusInternalServerError, "不能发送短信验证码")
	}
	return c.JSON(http.StatusOK, echo.Map{
		"mobile": user.Mobile,
		"smsid":  smsid,
	})
}
