package bulletin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除
func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	uuid := c.QueryParam("uuid")

	ql := `delete from bulletins where uuid = ?`

	// 删除记录
	err := db.ExecOne(ql, uuid)
	if err != nil {
		cc.ErrLog(err).Error("删除公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
