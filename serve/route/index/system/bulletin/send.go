package bulletin

import (
	"time"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 发布公告
func send(uuid, title, content string) {
	// status := 3

	// err := nats.PublishBulletin(uuid, title, content)
	// if err != nil {
	// 	xlog.X.WithError(err).Error("发布公告错")
	// 	status = 4
	// }
	// // 更新记录状态
	// ql := `update bulletins set status = ? where uuid = ?`

	// if err = db.ExecOne(ql, status, uuid); err != nil {
	// 	xlog.X.WithError(err).Error("更新公告状态错")
	// }
}

// 在指定时间发布公告
func sendAt(uuid, title, content string, send_time time.Time) {
	xlog.X.Infof("local sub: %v", send_time.Sub(time.Now()))
	xlog.X.Infof("utc sub: %v", send_time.UTC().Sub(time.Now()))

	// 如果发布时间在未来 1 分钟内则直接发送
	if time.Now().Add(1 * time.Minute).After(send_time) {
		send(uuid, title, content)
		return
	}
	time.AfterFunc(send_time.Sub(time.Now()), func() {
		send(uuid, title, content)
	})
}
