package xlog

import (
	"fmt"
	"strings"

	"github.com/fatih/color"
	"github.com/sirupsen/logrus"
)

type terminalHook struct {
	colors map[logrus.Level]color.Attribute
}

func newTerminalHook() *terminalHook {
	return &terminalHook{
		colors: map[logrus.Level]color.Attribute{
			logrus.DebugLevel: color.FgHiBlack,
			logrus.TraceLevel: color.FgHiBlack,
			logrus.InfoLevel:  color.FgCyan,
			logrus.WarnLevel:  color.FgYellow,
			logrus.ErrorLevel: color.FgRed,
			logrus.FatalLevel: color.FgMagenta,
			logrus.PanicLevel: color.FgHiRed,
		},
	}
}

func (h *terminalHook) Fire(entry *logrus.Entry) error {
	print := color.New(h.colors[entry.Level]).SprintfFunc()
	level := print("[%s]", strings.ToUpper(entry.Level.String()[:3]))

	realm := color.New(color.FgHiYellow).Sprintf("%-4s", entry.Data[FRealm])

	var message string

	err, ok := entry.Data["error"].(error)
	if ok {
		message = fmt.Sprintf("%s %s %s: %v", level, realm, entry.Message, err)
	} else {
		message = fmt.Sprintf("%s %s %s", level, realm, entry.Message)
	}
	_, err = fmt.Println(message)
	return err
}

func (h *terminalHook) Levels() []logrus.Level {
	return logrus.AllLevels
}
