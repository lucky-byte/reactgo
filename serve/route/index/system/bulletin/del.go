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

	ql := `select * from bulletins where uuid = ?`
	var bulletin db.Bulletin

	// 检查状态是否允许发布
	if err := db.SelectOne(ql, &bulletin, uuid); err != nil {
		cc.ErrLog(err).Error("查询公告状态错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if bulletin.Status == 3 {
		return c.String(http.StatusForbidden, "当前状态不能删除")
	}
	ql = `delete from bulletins where uuid = ?`

	// 删除记录
	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
