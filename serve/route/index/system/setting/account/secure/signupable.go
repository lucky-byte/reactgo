package secure

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 开放用户注册
func signupable(c echo.Context) error {
	cc := c.(*ctx.Context)

	var signupable bool

	err := echo.FormFieldBinder(c).MustBool("signupable", &signupable).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update account set signupable = ?`

	if err = db.ExecOne(ql, signupable); err != nil {
		cc.ErrLog(err).Error("更新账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
