package signin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询登录相关设置
func settings(c echo.Context) error {
	cc := c.(*ctx.Context)

	// 查询账号设置
	ql := `select * from account`
	var account db.Account

	err := db.SelectOne(ql, &account)
	if err != nil {
		cc.ErrLog(err).Error("查询账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 查询身份授权设置
	ql = `select provider from oauth where enabled = true order by sortno`
	var providers []string

	err = db.Select(ql, &providers)
	if err != nil {
		cc.ErrLog(err).Error("查询身份授权设置错")
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"signupable": account.Signupable,
		"lookuserid": account.LookUserid,
		"resetpass":  account.ResetPass,
		"providers":  providers,
	})
}
