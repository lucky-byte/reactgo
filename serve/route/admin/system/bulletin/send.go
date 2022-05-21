package bulletin

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 立即发布
func send(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select * from bulletins where uuid = ?`
	var bulletin db.Bulletin

	err = db.SelectOne(ql, &bulletin, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询公告状态错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 检查状态是否允许发布
	if bulletin.Status == 3 {
		return c.String(http.StatusForbidden, "当前状态不能发布")
	}
	send_time := time.Now().UTC()

	ql = `update bulletins set send_time = ? where uuid = ?`

	// 更新发布时间为当前时间
	err = db.ExecOne(ql, send_time, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 发布
	bulletin.SendTime = send_time
	sendAt(&bulletin)

	return c.NoContent(http.StatusOK)
}
