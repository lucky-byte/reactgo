package google

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/lib/login"
)

func signin(c echo.Context) error {
	cc := c.(*ctx.Context)

	var userid, state, clientid string

	err := echo.FormFieldBinder(c).
		MustString("clientid", &clientid).
		MustString("userid", &userid).
		MustString("state", &state).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&clientid, &userid, &state)

	// 查询登录授权时创建的记录是否匹配
	ql := `
		select * from user_oauth
		where uuid = ? and userid = ? and usage = 2 and status = 1
			and provider = 'google'
	`
	var record db.UserOAuth

	err = db.SelectOne(ql, &record, state, userid)
	if err != nil {
		cc.ErrLog(err).Error("查询 OAuth 登录记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if record.CreateAt.Before(time.Now().Add(-5 * time.Minute)) {
		cc.Log().Error("OAuth 登录超时")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 该记录不能再次使用，删除
	ql = `delete from user_oauth where uuid = ? and usage = 2`

	err = db.Exec(ql, state)
	if err != nil {
		cc.ErrLog(err).Error("清除 OAuth 登录记录错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 查询授权账号信息
	ql = `
		select * from user_oauth
		where provider = 'google' and status = 2 and userid = ?
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

	// 完成登录
	return login.Login(c, &user, clientid, 2, "google")
}
