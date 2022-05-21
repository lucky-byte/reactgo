package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询信息
func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from users where uuid = ?`
	var user db.User

	if err := db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"userid":         user.UserId,
		"name":           user.Name,
		"mobile":         user.Mobile,
		"email":          user.Email,
		"idno":           user.IdNo,
		"address":        user.Address,
		"acct_name":      user.AcctName,
		"acct_no":        user.AcctNo,
		"acct_idno":      user.AcctIdno,
		"acct_mobile":    user.AcctMobile,
		"acct_bank_name": user.AcctBankName,
		"tfa":            user.TFA,
	})
}
