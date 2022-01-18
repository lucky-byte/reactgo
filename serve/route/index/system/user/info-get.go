package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func getinfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		select userid, name, email, mobile, address, tfa from users
		where uuid = ?
	`
	var user db.User

	if err := db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"userid":  user.UserId,
		"name":    user.Name,
		"mobile":  user.Mobile,
		"email":   user.Email,
		"address": user.Address.String,
		"tfa":     user.TFA,
	})
}
