package notification

import (
	"log"

	"github.com/lucky-byte/reactgo/serve/db"
)

const (
	LevelTodo  = 0
	LevelInfo  = 1
	LevelWarn  = 2
	LevelError = 3
)

// 记录通知，可以指定接收人
func NotifyTo(to string, level int, title, message string) {
	ql := `
		insert into notifications (touser, level, title, message)
		values (?, ?, ?, ?)
	`
	if err := db.ExecOne(ql, to, level, title, message); err != nil {
		log.Printf("记录通知错: %v", err)
	}
}

// 记录通知，不给任何人
func Notify(level int, title, message string) {
	NotifyTo("", level, title, message)
}

func Todo(title, message string) {
	Notify(LevelTodo, title, message)
}

func Info(title, message string) {
	Notify(LevelInfo, title, message)
}

func Warn(title, message string) {
	Notify(LevelWarn, title, message)
}

func Error(title, message string) {
	Notify(LevelError, title, message)
}
