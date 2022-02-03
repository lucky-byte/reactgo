package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func clearTOTP(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 清除 TOTP
	ql := `
		update users set totp_secret = '', update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("清除 TOTP 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
