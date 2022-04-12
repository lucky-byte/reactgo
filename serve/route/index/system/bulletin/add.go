package bulletin

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/notification"
)

// 添加
func add(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var title, content string
	var status int
	var send_time time.Time

	err := echo.FormFieldBinder(c).
		MustString("title", &title).
		MustString("content", &content).
		MustInt("status", &status).
		Time("send_time", &send_time, time.RFC3339).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&title, &content)

	if status != 1 && status != 2 {
		return c.String(http.StatusBadRequest, "状态值无效")
	}
	// 未设置发布时间，取当前时间，数据库以 UTC 时间存储
	if send_time.IsZero() {
		send_time = time.Now().UTC()
	}
	ql := `
		insert into bulletins (
			uuid, user_uuid, title, content, send_time, status, targets, readers
		) values (
			?, ?, ?, ?, ?, ?, '', ''
		)
	`
	newid := uuid.NewString()

	err = db.ExecOne(ql, newid, user.UUID, title, content, send_time, status)
	if err != nil {
		cc.ErrLog(err).Error("添加公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果不是草稿则发布公告
	if status == 2 {
		sendAt(newid, title, content, send_time)
	}
	notification.Send(user.UUID, title, content, 2)

	return c.NoContent(http.StatusOK)
}
