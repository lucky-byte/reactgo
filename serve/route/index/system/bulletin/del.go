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

	ql := `select status from bulletins where uuid = ?`
	var status int

	err := db.SelectOne(ql, &status, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 已发布的公告不能删除，只能撤回后再删除
	if status == 3 {
		return c.String(http.StatusForbidden, "该公告已发布，不能删除，请先撤回")
	}
	ql = `delete from bulletins where uuid = ?`

	// 删除记录
	err = db.ExecOne(ql, uuid)
	if err != nil {
		cc.ErrLog(err).Error("删除公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
