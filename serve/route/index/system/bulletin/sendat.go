package bulletin

import (
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/notification"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 发布公告
func sendTo(uuid, title, content string) {
	ql := `select uuid from users where deleted = false`
	var users []db.User

	// 查询用户列表
	if err := db.Select(ql, &users); err != nil {
		xlog.X.WithError(err).Error("发送公告错，查询用户信息错")

		// 更新状态为发送失败
		ql = `update bulletins set status = 4 where uuid = ?`

		if err = db.ExecOne(ql, uuid); err != nil {
			xlog.X.WithError(err).Error("更新公告状态错")
		}
		return
	}
	// 发送用户通知
	for _, u := range users {
		notification.Send(u.UUID, title, content, 2, uuid)
	}
	// 更新状态为发送成功
	ql = `update bulletins set status = 3 where uuid = ?`

	if err := db.ExecOne(ql, uuid); err != nil {
		xlog.X.WithError(err).Error("更新公告状态错")
	}
}

// 在指定时间发布公告
func sendAt(uuid, title, content string, send_time time.Time) {
	// 如果发布时间在未来 1 分钟内则直接发送
	if time.Now().Add(1 * time.Minute).After(send_time) {
		sendTo(uuid, title, content)
		return
	}
	time.AfterFunc(send_time.Sub(time.Now()), func() {
		sendTo(uuid, title, content)
	})
}

// 重新发送所有公告
func sendAll() {
	ql := `select * from bulletins where status = 2 or status = 4`
	var bulletins []db.Bulletin

	if err := db.Select(ql, &bulletins); err != nil {
		xlog.X.WithError(err).Error("查询公告错")
	}
	for _, b := range bulletins {
		sendAt(b.UUID, b.Title, b.Content, b.SendTime)
	}
}
