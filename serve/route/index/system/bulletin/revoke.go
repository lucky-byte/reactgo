package bulletin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/notification"
)

// 撤销
func revoke(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select status from bulletins where uuid = ?`
	var bulletin db.Bulletin

	err = db.SelectOne(ql, &bulletin, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询公告状态错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 检查状态是否允许撤销
	if bulletin.Status != 3 {
		return c.String(http.StatusForbidden, "当前状态不能撤销")
	}

	ql = `update bulletins set status = 1 where uuid = ?`

	// 设置为草稿状态
	err = db.ExecOne(ql, uuid)
	if err != nil {
		cc.ErrLog(err).Error("撤销公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 撤销所有用户通知
	notification.RevokeAll(uuid)

	return c.NoContent(http.StatusOK)
}
