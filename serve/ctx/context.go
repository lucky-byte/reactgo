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
	node   *db.Tree
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

// 获取配置
func (c *Context) Config() *config.ViperConfig {
	return c.config
}

// 设置登录用户
func (c *Context) SetUser(u *db.User) {
	c.user = u

	// 增加新的日志字段
	c.logger = c.logger.WithField("user", u.Name).WithField("userid", u.UserId)
}

// 获取登录用户
func (c *Context) User() *db.User {
	return c.user
}

// 设置用户访问控制
func (c *Context) SetAllows(a []db.ACLAllow) {
	allows := AclAllows{}

	for _, v := range a {
		allows[v.Code] = v
	}
	c.allows = allows
}

// 获取用户访问控制
func (c *Context) Allows() AclAllows {
	return c.allows
}

// 检查用户是否有访问权限
func (c *Context) AllowRead(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.IRead
		}
	}
	return false
}

// 检查用户是否有修改权限
func (c *Context) AllowWrite(code int) bool {
	if c.allows != nil {
		if v, ok := c.allows[code]; ok {
			return v.IWrite
		}
	}
	return false
}

// 检查用户是否有管理权限
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

// 设置用户绑定的节点
func (c *Context) SetNode(n *db.Tree) {
	c.node = n

	// 增加新的日志字段
	c.logger = c.logger.WithField("node", n.Name)
}

// 获取用户绑定的节点
func (c *Context) Node() *db.Tree {
	return c.node
}

// 通过类型查询节点(包含子节点)绑定的实体
func (c *Context) NodeEntities(tp int) ([]db.TreeBind, error) {
	if c.node == nil {
		return nil, fmt.Errorf("用户没有绑定节点")
	}
	if c.node.Disabled {
		return nil, fmt.Errorf("用户绑定的节点已被禁用")
	}
	// 查询用户绑定节点的所有子节点
	ql := `select uuid from tree where disabled = false and tpath like ?`
	var nodes []string

	err := db.Select(ql, &nodes, c.node.TPath+"%")
	if err != nil {
		return nil, err
	}
	// 查询节点关联的实体
	ql = `select * from tree_bind where node in (?) and type = ?`
	ql, args, err := db.In(ql, nodes, tp)
	if err != nil {
		return nil, err
	}
	var binds []db.TreeBind

	err = db.Select(ql, &binds, args...)
	if err != nil {
		return nil, err
	}
	return binds, nil
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
			cc := &Context{c, l, conf, nil, nil, nil}

			c.Response().Before(func() {
				urlpath := c.Request().URL.Path

				elapsed := time.Since(now).Seconds()
				if elapsed > 3 {
					// 如果处理请求超出 3 秒，记录一条警告
					cc.Log().Warnf("处理 %s 使用了 %f 秒", urlpath, elapsed)
				} else if elapsed > 1 {
					// 如果处理请求超出 1 秒，记录一条信息
					s := fmt.Sprintf("处理 %s 使用了 %f 秒", urlpath, elapsed)
					event.Add(event.LevelTodo, s, "请分析该请求的处理方式是否有优化空间")
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
			return next(cc)
		}
	}
}
