package nats

import (
	"fmt"
)

type Notification struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	Type    int    `json:"type"`
}

// 发布用户通知
func PublishNotification(user, title, content string, ntype int) error {
	if Broker == nil {
		return fmt.Errorf("未连接 nats 服务器，不能发布用户通知")
	}
	subject := "reactgo.user.notification." + user

	return Broker.Publish(subject, &Notification{
		Title:   title,
		Content: content,
		Type:    ntype,
	})
}
