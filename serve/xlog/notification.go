package xlog

import (
	"github.com/sirupsen/logrus"
)

type notificationHook struct {
}

func newNotificationHook() *notificationHook {
	return &notificationHook{}
}

func (h *notificationHook) Fire(entry *logrus.Entry) error {
	// print := color.New(h.colors[entry.Level]).SprintfFunc()
	// level := print("[%s]", strings.ToUpper(entry.Level.String()[:3]))

	// realm := color.New(color.FgHiYellow).Sprintf("%-4s", entry.Data[FRealm])

	// var message string

	// err, ok := entry.Data["error"].(error)
	// if ok {
	// 	message = fmt.Sprintf("%s %s %s: %v", level, realm, entry.Message, err)
	// } else {
	// 	message = fmt.Sprintf("%s %s %s", level, realm, entry.Message)
	// }
	// _, err = fmt.Println(message)
	// return err
	return nil
}

func (h *notificationHook) Levels() []logrus.Level {
	return []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
		logrus.WarnLevel,
	}
}
