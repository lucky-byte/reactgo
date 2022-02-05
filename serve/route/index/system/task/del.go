package task

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 删除
	ql := `delete from tasks where uuid = ?`

	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除任务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
