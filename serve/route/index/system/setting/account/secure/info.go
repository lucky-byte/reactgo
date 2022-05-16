package secure

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from account`
	var result db.Account

	if err := db.SelectOne(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"signupable":   result.Signupable,
		"lookuserid":   result.LookUserid,
		"resetpass":    result.ResetPass,
		"sessduration": result.SessDuration,
		"jwtsignkey":   result.JWTSignKey,
	})
}
