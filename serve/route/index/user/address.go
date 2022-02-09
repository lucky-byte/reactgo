package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func address(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var address string

	err := echo.FormFieldBinder(c).MustString("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	cc.Trim(&address)

	ql := `
		update users set address = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, address, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改地址失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
