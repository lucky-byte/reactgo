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
		cc.ErrLog(err).Error("请求参数无效")
		return c.NoContent(http.StatusBadRequest)
	}
	cc.Trim(&username, &email)

	// 查询用户信息
	ql := `select * from users where userid = ? and email = ?`
	var user db.User

	if err = db.SelectOne(ql, &user, username, email); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.String(http.StatusBadRequest, "未查询到用户信息")
	}

	// 验证
	if err = mailfs.VerifyCode(id, code, email); err != nil {
		cc.ErrLog(err).Error("验证邮件验证码错")
		return c.String(http.StatusBadRequest, "验证失败")
	}

	// 发送验证码
	smsid, err := sms.SendCode(user.Mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码错")
		return c.String(http.StatusInternalServerError, "发送短信验证码错")
	}
	return c.JSON(http.StatusOK, echo.Map{
		"mobile": user.Mobile,
		"smsid":  smsid,
	})
}
