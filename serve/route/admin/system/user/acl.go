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
	// 检查是否可修改
	if _, err = isUpdatable(uuid); err != nil {
		cc.ErrLog(err).Error("修改用户 ACL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新
	ql := `
		update users set acl = ?, update_at = current_timestamp
		where uuid = ? and disabled = false and deleted = false
	`
	if err := db.ExecOne(ql, acl, uuid); err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
