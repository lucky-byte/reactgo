package notification

import (
	"github.com/google/uuid"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 发布用户通知
func send(user *db.User, title, content string, ntype int, refer string) {
	ql := `
		insert into notifications (uuid, user_uuid, title, content, type, refer)
		values (? ,?, ?, ?, ?, ?)
	`
	newid := uuid.NewString()

	// 记录通知记录
	err := db.ExecOne(ql, newid, user.UUID, title, content, ntype, refer)
	if err != nil {
		xlog.X.WithError(err).Error("记录用户通知错")
		return
	}
	// 发布到消息队列
	err = nats.PublishNotification(user.UUID, title, content, ntype)
	if err != nil {
		xlog.X.WithError(err).Error("发布用户通知错")
	}
	// 如果用户设置通知转发邮件，则发送邮件给用户
	if user.NotiMail {
		sendMail(user, title, content, ntype)
	}
}

// 发送通知邮件
func sendMail(user *db.User, title, content string, ntype int) {
}

// 发布单个用户通知
func Send(user_uuid, title, content string, ntype int, refer string) {
	ql := `select * from users where uuid = ?`
	var user db.User

	err := db.SelectOne(ql, &user, user_uuid)
	if err != nil {
		xlog.X.WithError(err).Error("发送通知失败，查询用户信息错")
		return
	}
	if user.Deleted {
		xlog.X.Warnf("不能发送通知给已删除的用户 %s", user.Name)
	}
	send(&user, title, content, ntype, refer)
}

// 发布所有用户通知
func SendAll(title, content string, ntype int, refer string) {
	ql := `select * from users where deleted = false`
	var users []db.User

	err := db.Select(ql, &users)
	if err != nil {
		xlog.X.WithError(err).Error("发送通知失败，查询用户信息错")
		return
	}
	for _, u := range users {
		send(&u, title, content, ntype, refer)
	}
}
