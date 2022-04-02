package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改节点名称
func name(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, name string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("name", &name).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `
		update tree set name = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, name, uuid); err != nil {
		cc.ErrLog(err).Error("更新节点名称错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
