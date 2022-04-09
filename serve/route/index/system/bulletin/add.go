package bulletin

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
)

// 添加
func add(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var title, content string
	var draft bool
	var send_time time.Time

	err := echo.FormFieldBinder(c).
		MustString("title", &title).
		MustString("content", &content).
		MustBool("draft", &draft).
		Time("send_time", &send_time, time.RFC3339).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&title, &content)

	// 未设置发布时间，取当前时间，数据库以 UTC 时间存储
	if send_time.IsZero() {
		send_time = time.Now().UTC()
	}
	ql := `
		insert into bulletins (uuid, title, content, send_time, draft, user_uuid)
		values (?, ?, ?, ?, ?, ?)
	`
	id := uuid.NewString()

	err = db.ExecOne(ql, id, title, content, send_time, draft, user.UUID)
	if err != nil {
		cc.ErrLog(err).Error("添加公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果发布时间在未来 1 分钟内则直接发送
	if time.Now().Add(1 * time.Minute).UTC().After(send_time) {
		if err = nats.PublishBulletin(id, title, content); err != nil {
			cc.ErrLog(err).Error("发布公告错")
		}
	} else {
	}
	return c.NoContent(http.StatusOK)
}
