package bulletin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除
func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update bulletins set deleted = true where uuid = ?`

	if err = db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
