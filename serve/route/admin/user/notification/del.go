package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除单个通知
func del(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	uuid := c.Param("uuid")

	ql := `delete from notifications where user_uuid = ? and uuid = ?`

	err := db.ExecOne(ql, user.UUID, uuid)
	if err != nil {
		cc.ErrLog(err).Error("删除通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
