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
		cc.ErrLog(err).Error("请求参数无效")
		return c.NoContent(http.StatusBadRequest)
	}
	cc.Trim(&username, &email)

	if _, err = mail.ParseAddress(email); err != nil {
		cc.ErrLog(err).Error("解析邮箱地址错误")
		c.String(http.StatusBadRequest, "邮箱地址格式错误")
	}

	// 查询是否允许找回密码
	ql := `select resetpass from settings`
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
		cc.ErrLog(err).Error("查询用户信息错")
		return c.String(http.StatusBadRequest, "未查询到用户信息")
	}
	if len(user.Mobile) == 0 {
		return c.String(http.StatusForbidden, "用户未设置手机号")
	}
	if user.Disabled || user.Deleted {
		return c.String(http.StatusForbidden, "该用户状态非正常")
	}

	// 发送验证码到邮箱
	id, err := mailfs.SendCode(email, user.Name)
	if err != nil {
		cc.ErrLog(err).Error("发送验证邮件错")
		return c.String(http.StatusInternalServerError, "发送验证邮件错")
	}
	return c.JSON(http.StatusOK, echo.Map{"id": id})
}
