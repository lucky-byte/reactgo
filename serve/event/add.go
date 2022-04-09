package event

import (
	"log"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
)

const (
	LevelTodo  = 0
	LevelInfo  = 1
	LevelWarn  = 2
	LevelError = 3
)

// 记录事件
func Add(level int, title, message string) {
	ql := `
		insert into events (uuid, level, title, message) values (?, ?, ?, ?)
	`
	err := db.ExecOne(ql, uuid.NewString(), level, title, message)
	if err != nil {
		log.Printf("记录事件错: %v", err)
	}
	// 发布事件到消息队列
	if err = nats.PublishEvent(level, title, message); err != nil {
		log.Printf("发布 nats 事件错: %v", err)
	}
}

func Todo(title, message string) {
	Add(LevelTodo, title, message)
}

func Info(title, message string) {
	Add(LevelInfo, title, message)
}

func Warn(title, message string) {
	Add(LevelWarn, title, message)
}

func Error(title, message string) {
	Add(LevelError, title, message)
}
