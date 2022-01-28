package settings

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func secureConfig(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from settings`
	var result db.Settings

	if err := db.SelectOne(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"resetpass": result.ResetPass,
	})
}

func resetpass(c echo.Context) error {
	cc := c.(*ctx.Context)

	var resetpass bool

	err := echo.FormFieldBinder(c).MustBool("resetpass", &resetpass).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `update settings set resetpass = ?`

	if err = db.ExecOne(ql, resetpass); err != nil {
		cc.ErrLog(err).Error("更新系统设置错")
	}
	return c.NoContent(http.StatusOK)
}
