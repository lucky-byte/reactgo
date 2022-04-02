package sms

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改正文模板 ID
func msgid(c echo.Context) error {
	cc := c.(*ctx.Context)

	var n uint
	var id string

	err := echo.FormFieldBinder(c).
		MustUint("n", &n).MustString("id", &id).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := fmt.Sprintf(`update sms_settings set msgid%d = ?`, n)

	if err = db.ExecOne(ql, id); err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
