package ctx

import (
	"strings"

	"github.com/lucky-byte/bdb/serve/config"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/xlog"

	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
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
			return v.Read
		}
	}
	return false
}

func (c *Context) AllowWrite(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.Write
		}
	}
	return false
}

func (c *Context) AllowAdmin(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.Admin
		}
	}
	return false
}

func Middleware(conf *config.ViperConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			reqid := c.Response().Header().Get(echo.HeaderXRequestID)
			req := c.Request()

			// attach a logger to echo.Context.
			l := xlog.X.WithFields(logrus.Fields{
				xlog.FReqID:  reqid,
				xlog.FPath:   req.URL.Path,
				xlog.FMethod: req.Method,
				xlog.FIP:     c.RealIP(),
			})
			// cache the static assets in client
			c.Response().Before(func() {
				urlpath := c.Request().URL.Path

				if strings.HasPrefix(urlpath, "/static/js/") {
					c.Response().Header().Set("cache-control", "max-age=31536000")
				}
			})
			cc := &Context{c, l, conf, nil, nil}
			return next(cc)
		}
	}
}