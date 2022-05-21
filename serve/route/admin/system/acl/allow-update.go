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
	var iread, iwrite, iadmin bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustBool("iread", &iread).
		MustBool("iwrite", &iwrite).
		MustBool("iadmin", &iadmin).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `
		update acl_allows set iread = ?, iwrite = ?, iadmin = ?
		where uuid = ?
	`
	if err = db.Exec(ql, iread, iwrite, iadmin, uuid); err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
