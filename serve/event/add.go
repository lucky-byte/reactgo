package event

import (
	"log"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/nats"
)

const (
	LevelTodo     = 0
	LevelInfo     = 1
	LevelWarn     = 2
	LevelError    = 3
	LevelSecurity = 4
)

// 记录事件
// message 支持 Markdown 语法
func Add(level int, title, message string) {
	ql := `
		insert into events (uuid, level, title, message) values (?, ?, ?, ?)
	`
	err := db.ExecOne(ql, uuid.NewString(), level, title, message)
	if err != nil {
		log.Printf("记录事件错: %v", err)
	}
	// 发布事件到消息队列
	err = nats.PublishEvent(level, title, message)
	if err != nil {
		log.Printf("发布事件到 NATS 错: %v", err)
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

func Security(title, message string) {
	Add(LevelSecurity, title, message)
}
