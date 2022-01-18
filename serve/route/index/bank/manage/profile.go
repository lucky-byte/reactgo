package manage

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func profile(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 查询信息
	ql := `select * from bank_develops where uuid = ?`
	var develop db.BankDevelop

	if err = db.SelectOne(ql, &develop, uuid); err != nil {
		cc.ErrLog(err).Error("查询渠道开发商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"create_at": develop.CreateAt,
		"update_at": develop.UpdateAt,
		"disabled":  develop.Disabled,
		"deleted":   develop.Deleted,
		"name":      develop.Name,
		"mobile":    develop.Mobile,
		"email":     develop.Email,
		"company":   develop.Company.String,
		"address":   develop.Address.String,
	})
}
