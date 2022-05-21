package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func userid(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var userid string

	err := echo.FormFieldBinder(c).MustString("userid", &userid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&userid)

	ql := `select count(*) from users where userid = ?`
	var count int

	if err = db.SelectOne(ql, &count, userid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, "登录名已存在")
	}
	ql = `
		update users set userid = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, userid, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改登录名失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
