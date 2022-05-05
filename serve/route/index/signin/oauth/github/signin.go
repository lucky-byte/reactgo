package github

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func signin(c echo.Context) error {
	cc := c.(*ctx.Context)

	var userid, state string

	err := echo.FormFieldBinder(c).
		MustString("userid", &userid).
		MustString("state", &state).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}

	ql := `
		select * from user_oauth
		where uuid = ? and usage = 2 and status = 1 and provider = 'github'
	`
	var record db.UserOAuth

	err = db.SelectOne(ql, &record, state)
	if err != nil {
		cc.ErrLog(err).Error("查询 OAuth 登录记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if record.CreateAt.Before(time.Now().Add(-5 * time.Minute)) {
		cc.Log().Error("OAuth 登录超时")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 该记录不能再次使用
	ql = `delete from user_oauth where uuid = ? and usage = 2`
	db.Exec(ql, state)

	// 查询授权账号信息
	ql = `
		select * from user_oauth
		where provider = 'github' and status = 2 and userid = ?
	`
	var account db.UserOAuth

	err = db.SelectOne(ql, &account, userid)
	if err != nil {
		cc.ErrLog(err).Error("查询 OAuth 账号信息错")
		return c.String(http.StatusNotFound, "账号不存在")
	}

	// 查询用户信息
	ql = `select * from users where uuid = ?`
	var user db.User

	err = db.SelectOne(ql, &user, account.UserUUID)
	if err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.String(http.StatusNotFound, "用户不存在")
	}
	cc.Log().Infof("user: %v", user)

	return c.NoContent(http.StatusOK)
}
