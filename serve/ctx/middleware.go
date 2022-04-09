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
	"github.com/sirupsen/logrus"
)

func Middleware(conf *config.ViperConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			now := time.Now()

			reqid := c.Response().Header().Get(echo.HeaderXRequestID)
			req := c.Request()

			// 将 logger 附属到 Context，后续可以使用
			l := xlog.X.WithFields(logrus.Fields{
				xlog.FReqID:  reqid,
				xlog.FPath:   req.URL.Path,
				xlog.FMethod: req.Method,
				xlog.FIP:     c.RealIP(),
			})
			cc := &Context{c, l, conf, nil, nil, nil}

			c.Response().Before(func() {
				urlpath := c.Request().URL.Path

				elapsed := time.Since(now).Seconds()
				if elapsed > 3 { // 如果处理请求超出 3 秒，记录一条警告
					cc.Log().Warnf("处理 %s 耗时 %f 秒", urlpath, elapsed)
				} else if elapsed > 1 { // 如果处理请求超出 1 秒，记录一条信息
					s := fmt.Sprintf("处理 %s 耗时 %f 秒", urlpath, elapsed)
					event.Add(event.LevelTodo, s, s)
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
