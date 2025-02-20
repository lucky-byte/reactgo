package event

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 清除
func clean(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `delete from events`

	err := db.Exec(ql)
	if err != nil {
		cc.ErrLog(err).Error("清除事件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
