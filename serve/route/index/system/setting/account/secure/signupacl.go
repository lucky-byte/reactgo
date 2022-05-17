package secure

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 更新注册角色
func signupacl(c echo.Context) error {
	cc := c.(*ctx.Context)

	var acl string

	err := echo.FormFieldBinder(c).MustString("acl", &acl).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update account set signupacl = ?`

	err = db.ExecOne(ql, acl)
	if err != nil {
		cc.ErrLog(err).Error("更新账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
