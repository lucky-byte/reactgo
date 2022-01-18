package merch

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
	ql := `select * from merch_develops where uuid = ?`
	var user db.MerchDevelop

	if err := db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询商户拓展商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"name":    user.Name,
		"mobile":  user.Mobile,
		"email":   user.Email,
		"address": user.Address.String,
		"company": user.Company.String,
	})
}
