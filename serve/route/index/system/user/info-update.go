package user

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func updateinfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, userid, name, email, mobile, address string
	var tfa bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("userid", &userid).
		MustString("name", &name).
		MustString("email", &email).
		MustString("mobile", &mobile).
		Bool("tfa", &tfa).
		String("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	// 删除前后空白字符
	cc.Trim(&userid, &name, &email, &mobile, &address)

	// 查询 userid 是否冲突
	ql := `select count(*) from users where userid = ? and uuid <> ?`
	var count int

	if err := db.SelectOne(ql, &count, userid, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("%s 已存在", userid))
	}
	// 更新信息
	ql = `
		update users set
			userid = ?, name = ?, email = ?, mobile = ?, address = ?, tfa = ?,
			update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, userid, name, email, mobile, address, tfa, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
