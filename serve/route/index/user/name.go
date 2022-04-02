package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func name(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var name string

	err := echo.FormFieldBinder(c).MustString("name", &name).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&name)

	ql := `
		update users set name = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, name, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改姓名失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
