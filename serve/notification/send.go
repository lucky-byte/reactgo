package notification

import (
	"github.com/google/uuid"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 发布用户通知
func Send(user, title, content string, ntype int) {
	ql := `
		insert into notifications (uuid, user_uuid, title, content, type)
		values (? ,?, ?, ?, ?)
	`
	newid := uuid.NewString()

	if err := db.ExecOne(ql, newid, user, title, content, ntype); err != nil {
		xlog.X.WithError(err).Error("记录用户通知错")
	}
	err := nats.PublishNotification(user, title, content, ntype)
	if err != nil {
		xlog.X.WithError(err).Error("发布用户通知错")
	}
}
