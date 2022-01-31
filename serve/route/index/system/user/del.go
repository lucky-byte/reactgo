package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func del(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// 不能删除自己的账号
	if uuid == user.UUID {
		return c.String(http.StatusForbidden, "不可以删除自己的账号")
	}
	// 更新用户状态
	ql := `
		update users set deleted = true, update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
