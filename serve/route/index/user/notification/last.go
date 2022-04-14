package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取最近通知
func last(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	// 查询未读通知数量
	ql := `select count(*) from notifications where user_uuid = ? and status = 1`
	var unread int

	if err := db.SelectOne(ql, &unread, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询最近的 3 条记录
	ql = `
		select uuid, create_at, type, title, content, status
		from notifications
		where user_uuid = ?
		order by status, create_at desc limit 3
	`
	var last []db.Notification

	if err := db.Select(ql, &last, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{"unread": unread, "last": last})
}
