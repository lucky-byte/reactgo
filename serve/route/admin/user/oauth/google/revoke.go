package google

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 撤销授权账号
func revoke(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	ql := `delete from user_oauth where user_uuid = ? and provider = 'google'`

	err := db.Exec(ql, user.UUID)
	if err != nil {
		cc.ErrLog(err).Error("撤销用户 Google 授权账号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
