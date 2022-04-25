package mail

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除邮件传输代理
func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &mta_uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `delete from mtas where uuid = ?`

	if err := db.ExecOne(ql, mta_uuid); err != nil {
		cc.ErrLog(err).Error("删除邮件服务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
