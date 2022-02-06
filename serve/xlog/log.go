package xlog

import (
	"path"
	"runtime"
	"strconv"

	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/lucky-byte/reactgo/serve/config"
)

// common field names
const (
	FRealm  = "realm"  // realm
	FReqID  = "reqid"  // http request id
	FIP     = "ip"     // http client ip
	FPath   = "path"   // http request url path
	FMethod = "method" // http request method
)

// keep X usable(not panic) before Setup
var X = logrus.StandardLogger().WithField(FRealm, "unknown")

// Setup logger
func Setup(debug bool, conf *config.ViperConfig) {
	l := logrus.New()

	l.SetReportCaller(true)

	// to file bdb.log
	rotate_logger := &lumberjack.Logger{
		Filename:  path.Join(conf.LogPath(), "reactgo.log"),
		MaxSize:   20,
		Compress:  true,
		LocalTime: true,
	}
	// json format
	l.SetFormatter(&logrus.JSONFormatter{
		CallerPrettyfier: func(f *runtime.Frame) (function string, file string) {
			function = path.Base(f.Function)
			file = path.Base(f.File) + ":" + strconv.Itoa(f.Line)
			return
		},
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyMsg: "message",
		},
		PrettyPrint: debug,
	})
	l.SetOutput(rotate_logger)

	// 发送通知
	l.AddHook(newNotificationHook())

	if debug {
		l.AddHook(newTerminalHook())
		l.SetLevel(logrus.TraceLevel)
	} else {
		l.SetLevel(logrus.InfoLevel)
	}
	// set default realm to 'main'
	X = l.WithField(FRealm, "main")
}

// F is a shortcut of withFields
//
//   withFields usage:  xlog.withFields(logrus.Fields{"key", value, ...}).Info(...)
//   F usage: xlog.F("key", value, ...).Info(...)
func F(args ...interface{}) *logrus.Entry {
	if len(args)%2 != 0 {
		X.Panicf("Number of F(...) args must be even, current %d", len(args))
	}
	fields := logrus.Fields{}

	for i := 0; i < len(args); i += 2 {
		if s, ok := args[i].(string); !ok {
			X.Panicf("#%d arg %[2]v(%[2]T) must be string", i, args[i])
		} else {
			fields[s] = args[i+1]
		}
	}
	return X.WithFields(fields)
}
