package resetpass

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
)

// 发送邮箱验证码
func emailcode(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, email string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).MustString("email", &email).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&username, &email)

	if _, err = mail.ParseAddress(email); err != nil {
		cc.ErrLog(err).Errorf("解析邮箱地址(%s)错误", email)
		c.String(http.StatusBadRequest, "邮箱地址格式错误")
	}

	// 查询是否允许找回密码
	ql := `select resetpass from account`
	var resetpass bool

	if err := db.SelectOne(ql, &resetpass); err != nil {
		cc.ErrLog(err).Error("查询设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if !resetpass {
		return c.String(http.StatusForbidden, "不允许找回登录密码")
	}

	// 查询用户信息
	ql = `select * from users where userid = ? and email = ?`
	var user db.User

	if err = db.SelectOne(ql, &user, username, email); err != nil {
		cc.ErrLog(err).Errorf("查询用户 %s(%s) 信息错", username, email)
		return c.String(http.StatusBadRequest, "未查询到用户信息")
	}
	if user.Disabled || user.Deleted {
		cc.Log().Warn("非正常状态的用户 %s 尝试找回密码", user.Name)
		return c.String(http.StatusForbidden, "该用户状态非正常")
	}
	if len(user.Mobile) == 0 {
		return c.String(http.StatusForbidden, "用户未设置手机号")
	}

	// 发送验证码到邮箱
	id, err := mailfs.SendCode(email, user.Name)
	if err != nil {
		cc.ErrLog(err).Errorf("发送验证邮件到 %s 失败", email)
		return c.String(http.StatusInternalServerError, "不能发送验证邮件")
	}
	return c.JSON(http.StatusOK, echo.Map{"id": id})
}
