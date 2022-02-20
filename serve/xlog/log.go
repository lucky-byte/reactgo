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
	FReqID  = "reqid"  // http request id
	FIP     = "ip"     // http client ip
	FPath   = "path"   // http request url path
	FMethod = "method" // http request method
)

// keep X usable(not panic) before Setup
var X = logrus.StandardLogger()

// 配置日志
func Setup(debug bool, conf *config.ViperConfig) {
	if conf.Debug() {
		logrus.SetLevel(logrus.TraceLevel)
	} else {
		logrus.SetLevel(logrus.InfoLevel)
	}
	X = logrus.New()

	X.SetReportCaller(true)

	// 日志文件
	rotate_logger := &lumberjack.Logger{
		Filename:  path.Join(conf.LogPath(), "reactgo.log"),
		MaxSize:   20,
		Compress:  true,
		LocalTime: true,
	}
	// JSON 格式
	X.SetFormatter(&logrus.JSONFormatter{
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
	X.SetOutput(rotate_logger)

	if debug {
		X.AddHook(newTerminalHook())
		X.SetLevel(logrus.TraceLevel)
	} else {
		X.SetLevel(logrus.InfoLevel)
	}
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
