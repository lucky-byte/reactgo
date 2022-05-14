package bulletin

import (
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/notification"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 发布公告
func sendDo(b *db.Bulletin) {
	ql := `update bulletins set status = 3 where uuid = ?`

	// 更新状态为发送成功
	// 这里有可能失败，例如用户设置了定时发布，未发布之前删除了该记录
	err := db.ExecOne(ql, b.UUID)
	if err != nil {
		xlog.X.WithError(err).Error("更新公告状态错")
		return
	}
	// 允许发送用户通知
	if b.IsNotify {
		notification.SendAll(b.Title, b.Content, 2, b.UUID)
	}
}

// 在指定时间发布公告
func sendAt(b *db.Bulletin) {
	// 如果发布时间在未来 1 分钟内则直接发送
	if time.Now().Add(1 * time.Minute).After(b.SendTime) {
		sendDo(b)
		return
	}
	// 在将来发布
	time.AfterFunc(b.SendTime.Sub(time.Now()), func() {
		sendDo(b)
	})
}
