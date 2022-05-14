package nats

import (
	"fmt"
)

type Notification struct {
	Type    int    `json:"type"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// 发布用户通知
func PublishNotification(user, title, content string, ntype int) error {
	if Broker == nil {
		return fmt.Errorf("未连接 nats 服务器，不能发布用户通知")
	}
	subject := "reactgo.user.notification." + user

	if len(content) > 200 {
		content = content[:200]
	}
	return Broker.Publish(subject, &Notification{
		Type:    ntype,
		Title:   title,
		Content: content,
	})
}
