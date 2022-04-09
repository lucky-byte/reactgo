package nats

import (
	"fmt"
)

type Bulletin struct {
	UUID    string `json:"uuid"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// 发布公告
func PublishBulletin(uuid, title, content string) error {
	if Broker == nil {
		return fmt.Errorf("未连接 nats 服务器，不能发布公告")
	}
	return Broker.Publish("reactgo.system.bulletin", &Bulletin{
		UUID:    uuid,
		Title:   title,
		Content: content,
	})
}
