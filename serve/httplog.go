package main

import (
	"encoding/json"
	"io"
	"path"

	"github.com/lucky-byte/bdb/serve/xlog"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gopkg.in/natefinch/lumberjack.v2"
)

type terminalWriter struct {
}

func (w terminalWriter) Write(bytes []byte) (int, error) {
	var data map[string]interface{}

	if err := json.Unmarshal(bytes, &data); err != nil {
		xlog.X.WithError(err).Error("parse http json log error")
		return len(bytes), nil
	}
	xlog.X.Debugf("Done! bytes_in: %v, bytes_out: %v, latency: %v\n",
		data["bytes_in"], data["bytes_out"], data["latency_human"],
	)
	return len(bytes), nil
}

// Rotate http log file
// http access log save to file http.log
func httpLogMiddleware(debug bool, logpath string) echo.MiddlewareFunc {
	rotate_http_logger := &lumberjack.Logger{
		Filename:  path.Join(logpath, "bdb-http.log"),
		MaxSize:   20,
		Compress:  true,
		LocalTime: true,
	}
	var http_logger io.Writer = rotate_http_logger

	if debug {
		terminal := terminalWriter{}
		http_logger = io.MultiWriter(&terminal, rotate_http_logger)
	}
	return middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"remote_ip":"${remote_ip}","host":"${host}",` +
			`"referer":"${referer}","method":"${method}",` +
			`"uri":"${uri}","user_agent":"${user_agent}",` +
			`"status":${status},"error":"${error}",` +
			`"latency":${latency},"latency_human":"${latency_human}",` +
			`"bytes_in":${bytes_in},"bytes_out":${bytes_out}}` + "\n",
		Output: http_logger,
	})
}
