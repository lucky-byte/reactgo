package signin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/secure"
)

// 用户登录
func signin(c echo.Context) error {
	cc := c.(*ctx.Context)

	var username, password, clientid string

	err := echo.FormFieldBinder(c).
		MustString("username", &username).
		MustString("password", &password).
		MustString("clientid", &clientid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&username, &clientid)

	ql := `select * from users where userid = ?`
	var user db.User

	// 查询用户信息
	if err = db.SelectOne(ql, &user, username); err != nil {
		cc.ErrLog(err).Errorf("登录失败, 用户 %s 不存在", username)
		return c.String(http.StatusForbidden, "用户名或密码错误")
	}
	// 这里的主要作用是给日志增加用户信息
	cc.SetUser(&user)

	// 验证密码
	phc, err := secure.ParsePHC(user.Passwd)
	if err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 解析用户密码错", user.Name)
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}
	if err = phc.Verify(password); err != nil {
		cc.ErrLog(err).Errorf("%s 登录失败, 验证登录密码错", user.Name)
		return c.String(http.StatusForbidden, "登录名或密码错误")
	}

	// 完成登录
	return auth.Login(cc, &user, clientid, 1, "")

}
