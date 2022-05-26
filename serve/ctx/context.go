package ctx

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
)

type AclAllows map[int]db.ACLAllow

type Context struct {
	echo.Context
	logger       *logrus.Entry
	config       *config.ViperConfig
	user         *db.User
	acl          *db.ACL
	acl_features []string
	acl_allows   AclAllows
	node         *db.Tree
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

// 当请求参数不完整时，使用这个函数记录错误原因，然后返回 BadRequest 错误
func (c *Context) BadRequest(err error) error {
	err = errors.Wrapf(err, "%s", c.Request().URL.String())
	c.ErrLog(err).Errorf("请求参数不完整(%s)", c.Request().URL.Path)
	return c.NoContent(http.StatusBadRequest)
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
func (c *Context) SetAcl(a *db.ACL) {
	c.acl = a
}

// 获取用户访问控制
func (c *Context) Acl() *db.ACL {
	return c.acl
}

// 设置用户访问控制特征
func (c *Context) SetAclFeatures(a []string) {
	c.acl_features = a
}

// 获取用户访问控制特征
func (c *Context) AclFeatures() []string {
	return c.acl_features
}

// 设置用户访问控制权限
func (c *Context) SetAclAllows(a []db.ACLAllow) {
	allows := AclAllows{}

	for _, v := range a {
		allows[v.Code] = v
	}
	c.acl_allows = allows
}

// 获取用户访问控制权限
func (c *Context) AclAllows() AclAllows {
	return c.acl_allows
}

// 检查用户是否有访问权限
func (c *Context) AllowRead(code int) bool {
	if c.acl_allows != nil {
		if v, ok := c.acl_allows[code]; ok {
			return v.IRead
		}
	}
	return false
}

// 检查用户是否有修改权限
func (c *Context) AllowWrite(code int) bool {
	if c.acl_allows != nil {
		if v, ok := c.acl_allows[code]; ok {
			return v.IWrite
		}
	}
	return false
}

// 检查用户是否有管理权限
func (c *Context) AllowAdmin(code int) bool {
	if c.acl_allows != nil {
		if v, ok := c.acl_allows[code]; ok {
			return v.IAdmin
		}
	}
	return false
}

// 文件下载
func (c *Context) Download(b []byte, filename string) error {
	tmpfile, err := ioutil.TempFile(os.TempDir(), "download-*.tmp")
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
//   c.Trim(&str1, &str2, ...)
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
