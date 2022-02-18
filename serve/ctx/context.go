package ctx

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/event"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

type AclAllows map[int]db.ACLAllow

type Context struct {
	echo.Context
	logger *logrus.Entry
	config *config.ViperConfig
	user   *db.User
	allows AclAllows
}

func (c *Context) Log() *logrus.Entry {
	return c.logger
}

func (c *Context) SetLog(l *logrus.Entry) {
	c.logger = l
}

func (c *Context) ErrLog(err error) *logrus.Entry {
	return c.logger.WithError(err)
}

func (c *Context) Config() *config.ViperConfig {
	return c.config
}

func (c *Context) SetUser(u *db.User) {
	c.user = u
}

func (c *Context) User() *db.User {
	return c.user
}

func (c *Context) SetAllows(a []db.ACLAllow) {
	allows := AclAllows{}

	for _, v := range a {
		allows[v.Code] = v
	}
	c.allows = allows
}

func (c *Context) Allows() AclAllows {
	return c.allows
}

func (c *Context) AllowRead(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.IRead
		}
	}
	return false
}

func (c *Context) AllowWrite(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.IWrite
		}
	}
	return false
}

func (c *Context) AllowAdmin(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.IAdmin
		}
	}
	return false
}

// 文件下载
func (c *Context) Download(b []byte, filename string) error {
	tmpfile, err := ioutil.TempFile(os.TempDir(), "download-*.json")
	if err != nil {
		c.ErrLog(err).Error("创建临时文件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	defer os.Remove(tmpfile.Name())

	if _, err = tmpfile.Write(b); err != nil {
		c.ErrLog(err).Error("写入临时文件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if err = tmpfile.Close(); err != nil {
		c.ErrLog(err).Error("关闭临时文件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.Attachment(tmpfile.Name(), filename)
}

// 去除字符串前后空白字符，用法:
// c.Trim(&str1, &str2, ...)
func (c *Context) Trim(args ...*string) {
	for _, v := range args {
		*v = strings.TrimSpace(*v)
	}
}

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
			c.Response().Before(func() {
				urlpath := c.Request().URL.Path

				// 如果处理请求超出 1 秒，记录一条信息
				elapsed := time.Since(now).Seconds()
				if elapsed > 1 {
					t := fmt.Sprintf("处理 %s 使用了 %f 秒", urlpath, elapsed)
					l.Info(t)
					event.Add(event.LevelTodo, t, "请分析该请求的处理方式是否有优化空间")
				}
				// 对于下列资源启用客户端缓存
				if strings.HasPrefix(urlpath, "/static/js/") {
					c.Response().Header().Set("cache-control", "max-age=31536000")
				}
				if strings.HasPrefix(urlpath, "/static/media/") {
					c.Response().Header().Set("cache-control", "max-age=31536000")
				}
				if strings.HasPrefix(urlpath, "/static/css/") {
					c.Response().Header().Set("cache-control", "max-age=31536000")
				}
			})
			cc := &Context{c, l, conf, nil, nil}
			return next(cc)
		}
	}
}
