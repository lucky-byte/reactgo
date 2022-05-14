package nats

import "fmt"

type Event struct {
	Level   int    `json:"level"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// 发布事件到消息队列
func PublishEvent(level int, title, content string) error {
	if Broker == nil {
		return fmt.Errorf("未连接 nats 服务器，不能发布事件")
	}
	if len(content) > 200 {
		content = content[:200]
	}
	return Broker.Publish("reactgo.system.event", &Event{
		Level:   level,
		Title:   title,
		Content: content,
	})
}
