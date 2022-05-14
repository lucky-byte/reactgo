package notification

import (
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 撤销用户通知
func revoke(user *db.User, refer string) {
	ql := `delete from notifications where user_uuid = ? and refer = ?`

	// 记录通知记录
	err := db.Exec(ql, user.UUID, refer)
	if err != nil {
		xlog.X.WithError(err).Error("撤销用户通知错")
		return
	}
	// 发布撤销命令到消息队列
	err = nats.PublishNotification(user.UUID, "", "", -1)
	if err != nil {
		xlog.X.WithError(err).Error("撤销用户通知错")
	}
}

// 撤销单个用户通知
func Revoke(user_uuid, refer string) {
	ql := `select * from users where uuid = ?`
	var user db.User

	err := db.SelectOne(ql, &user, user_uuid)
	if err != nil {
		xlog.X.WithError(err).Error("撤销通知失败，查询用户信息错")
		return
	}
	revoke(&user, refer)
}

// 撤销所有用户通知
func RevokeAll(refer string) {
	ql := `select * from users where deleted = false`
	var users []db.User

	err := db.Select(ql, &users)
	if err != nil {
		xlog.X.WithError(err).Error("撤销通知失败，查询用户信息错")
		return
	}
	for _, u := range users {
		revoke(&u, refer)
	}
}
