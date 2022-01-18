package merch

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 更新状态
	ql := `
		update merch_develops set deleted = true,
			update_at = current_timestamp
		where uuid = ?
	`
	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("更新商户拓展商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
