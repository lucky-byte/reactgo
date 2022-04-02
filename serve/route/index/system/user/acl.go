package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func aclUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, acl string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("acl", &acl).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}

	// 更新用户状态
	ql := `
		update users set acl = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, acl, uuid); err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
