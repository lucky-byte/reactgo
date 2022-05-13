package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除全部通知
func clear(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	ql := `delete from notifications where user_uuid = ?`

	err := db.Exec(ql, user.UUID)
	if err != nil {
		cc.ErrLog(err).Error("删除通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
