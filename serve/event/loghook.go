package event

import (
	"encoding/json"
	"fmt"
	"path"
	"strings"

	"github.com/sirupsen/logrus"
)

const (
	FormatJson  = 1
	FormatField = 2
)

type eventHook struct {
	format int
}

func NewEventHook(format int) *eventHook {
	return &eventHook{format: format}
}

func (h *eventHook) Fire(entry *logrus.Entry) error {
	var level int

	switch entry.Level {
	case logrus.PanicLevel, logrus.ErrorLevel, logrus.FatalLevel:
		level = LevelError
	case logrus.WarnLevel:
		level = LevelWarn
	default:
		level = LevelInfo
	}
	// 可以以 2 种格式记录 Markdown
	if h.format == FormatJson {
		return h.fireJson(entry, level)
	}
	return h.fireField(entry, level)
}

// 以 JSON 格式记录日志字段
func (h *eventHook) fireJson(entry *logrus.Entry, level int) error {
	message := ""
	fields := make(logrus.Fields)

	for k, v := range entry.Data {
		switch v := v.(type) {
		case error:
			message = v.Error()
		default:
			fields[k] = v
		}
	}
	if entry.HasCaller() {
		fields["func"] = path.Base(entry.Caller.Function)
		fields["file"] = fmt.Sprintf("%s:%d",
			path.Base(entry.Caller.File), entry.Caller.Line,
		)
	}
	m, err := json.MarshalIndent(fields, "", "  ")
	if err != nil {
		return err
	}
	message = fmt.Sprintf("%s\n\n```json\n%s\n```", message, m)

	Add(level, entry.Message, message)
	return nil
}

// 以 k=v 格式记录日志字段
func (h *eventHook) fireField(entry *logrus.Entry, level int) error {
	message := ""
	fields := []string{}

	for k, v := range entry.Data {
		switch v := v.(type) {
		case error:
			message = v.Error()
		default:
			fields = append(fields, fmt.Sprintf("`%s`=`%s`", k, v))
		}
	}
	if entry.HasCaller() {
		fields = append(fields, fmt.Sprintf("`func`=`%s`",
			path.Base(entry.Caller.Function),
		))
		fields = append(fields, fmt.Sprintf("`file`=`%s:%d`",
			path.Base(entry.Caller.File), entry.Caller.Line,
		))
	}
	m := strings.Join(fields, ",")
	message = fmt.Sprintf("%s\n\n%s", message, m)

	Add(level, entry.Message, message)
	return nil
}

func (h *eventHook) Levels() []logrus.Level {
	return []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
		logrus.WarnLevel,
	}
}
