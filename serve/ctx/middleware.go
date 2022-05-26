package ctx

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/event"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/mssola/user_agent"
	"github.com/sirupsen/logrus"
)

func Middleware(conf *config.ViperConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			now := time.Now()

			reqid := c.Response().Header().Get(echo.HeaderXRequestID)
			req := c.Request()

			ua := user_agent.New(req.UserAgent())

			osinfo := ua.OSInfo()
			os := fmt.Sprintf("%s %s", osinfo.Name, osinfo.Version)

			name, version := ua.Browser()
			browser := fmt.Sprintf("%s %s", name, version)

			// 将 logger 附属到 Context，后续可以使用
			l := xlog.X.WithFields(logrus.Fields{
				xlog.FReqID:   reqid,
				xlog.FPath:    req.URL.Path,
				xlog.FMethod:  req.Method,
				xlog.FIP:      c.RealIP(),
				xlog.FOS:      os,
				xlog.FBrowser: browser,
			})
			cc := &Context{c, l, conf, nil, nil, nil, nil, nil}

			c.Response().Before(func() {
				urlpath := req.URL.Path
				method := req.Method

				elapsed := time.Since(now).Seconds()

				// 如果处理请求超出 3 秒，记录一条警告
				if elapsed > 3 {
					cc.Log().Warnf("%s %s 耗时 %f 秒", method, urlpath, elapsed)
				} else if elapsed > 1 {
					// 如果处理请求超出 1 秒，记录一条信息
					if conf.Debug() {
						s := fmt.Sprintf("%s %s 耗时 %f 秒", method, urlpath, elapsed)
						m := fmt.Sprintf("IP: `%s`, ReqID: `%s`", c.RealIP(), reqid)
						event.Add(event.LevelTodo, s, m)
					}
				}
				// 对于下列资源启用客户端缓存
				if c.Request().Method == http.MethodGet {
					if strings.HasPrefix(urlpath, "/static/js/") {
						c.Response().Header().Set("cache-control", "max-age=31536000")
					}
					if strings.HasPrefix(urlpath, "/static/media/") {
						c.Response().Header().Set("cache-control", "max-age=31536000")
					}
					if strings.HasPrefix(urlpath, "/static/css/") {
						c.Response().Header().Set("cache-control", "max-age=31536000")
					}
				}
			})
			return next(cc)
		}
	}
}
