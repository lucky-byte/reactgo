package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func allowUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string
	var read, write, admin bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustBool("read", &read).
		MustBool("write", &write).
		MustBool("admin", &admin).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		update acl_allows set read = ?, write = ?, admin = ?
		where uuid = ?
	`
	if err = db.Exec(ql, read, write, admin, uuid); err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
