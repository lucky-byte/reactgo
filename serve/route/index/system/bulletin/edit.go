package bulletin

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 编辑
func edit(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var id, title, content string
	var status int
	var send_time time.Time

	err := echo.FormFieldBinder(c).
		MustString("title", &title).
		MustString("content", &content).
		MustInt("status", &status).
		String("uuid", &id).
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
	if len(id) > 0 {
		ql := `
			update bulletins set user_uuid = ?, title = ?, content = ?,
				send_time = ?, status = ?
			where uuid = ?
		`
		err = db.ExecOne(ql, user.UUID, title, content, send_time, status, id)
		if err != nil {
			cc.ErrLog(err).Error("更新公告记录错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		ql := `
			insert into bulletins (
				uuid, user_uuid, title, content, send_time, status
			) values (
				?, ?, ?, ?, ?, ?
			)
		`
		id = uuid.NewString()

		err = db.ExecOne(ql, id, user.UUID, title, content, send_time, status)
		if err != nil {
			cc.ErrLog(err).Error("添加公告记录错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	// 如果是草稿则无需发布
	if status == 1 {
		return c.NoContent(http.StatusOK)
	}
	// 发布
	sendAt(id, title, content, send_time)

	return c.NoContent(http.StatusOK)
}
