package account

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func config(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from settings`
	var result db.Setting

	if err := db.SelectOne(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"resetpass":      result.ResetPass,
		"token_duration": result.TokenDuration,
	})
}
