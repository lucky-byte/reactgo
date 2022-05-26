package auth

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/lib/jwt2"
)

// 认证，每个受保护的请求都先经过此函数认证通过后才能调用，因此这是一个执行频率非常高的函数
func Authentication(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		// 验证登录 TOKEN
		authToken := c.Request().Header.Get("x-auth-token")
		if len(authToken) == 0 {
			cc.Log().Error("认证失败, 请求缺少认证 TOKEN")
			return c.NoContent(http.StatusUnauthorized)
		}
		jwt, err := jwt2.JWTParse(authToken)
		if err != nil {
			cc.ErrLog(err).Error("认证失败, 解析 TOKEN 错误")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 可能还未激活，例如未完成短信认证的情况下
		if !jwt.Activate {
			cc.Log().Error("认证失败, TOKEN 尚未激活, 可能还未完成 2FA 认证")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 查询用户信息
		err = setAuthUser(cc, jwt.User)
		if err != nil {
			cc.ErrLog(err).Error("认证失败，查询用户信息错")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 查询用户访问控制角色
		err = SetAcl(cc)
		if err != nil {
			cc.ErrLog(err).Error("认证失败，查询用户访问控制错")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 查询用户绑定的层级节点
		err = setTreeNode(cc)
		if err != nil {
			cc.ErrLog(err).Error("认证失败，查询绑定节点错")
			return c.NoContent(http.StatusUnauthorized)
		}
		return next(c)
	}
}

// 查询用户信息，存储到 ctx.Context 中
func setAuthUser(cc *ctx.Context, user_uuid string) error {
	ql := `select * from users where uuid = ?`
	var user db.User

	// 查询用户信息
	err := db.SelectOne(ql, &user, user_uuid)
	if err != nil {
		return errors.Wrap(err, "未查询到用户信息")
	}
	// 检查用户状态
	if user.Disabled || user.Deleted {
		return errors.Wrapf(err, "用户 %s 已被禁用或删除", user.Name)
	}
	cc.SetUser(&user)

	return nil
}

// 查询用户访问控制角色，存储到 ctx.Context 中
func SetAcl(cc *ctx.Context) error {
	user := cc.User()

	ql := `select * from acl where uuid = ?`
	var acl db.ACL

	err := db.SelectOne(ql, &acl, user.ACL)
	if err != nil {
		return errors.Wrapf(err, "查询用户 %s 访问控制信息错", user.Name)
	}
	cc.SetAcl(&acl)

	features := strings.Split(acl.Features, ",")

	// 是否含有 nologin 特征，如果有则不允许登录
	for i, feature := range features {
		trimed := strings.TrimSpace(feature)

		if trimed == "nologin" {
			return fmt.Errorf("用户 %s 角色 %s 含有 nologin 特征", user.Name, acl.Name)
		}
		features[i] = trimed
	}
	cc.SetAclFeatures(features)

	ql = `select * from acl_allows where acl = ?`
	var allows []db.ACLAllow

	err = db.Select(ql, &allows, user.ACL)
	if err != nil {
		return errors.Wrapf(err, "查询用户 %s 访问控制错误", user.Name)
	}
	cc.SetAclAllows(allows)

	return nil
}

// 查询用户绑定的层级节点
func setTreeNode(cc *ctx.Context) error {
	user := cc.User()

	ql := `
		select * from tree where uuid = (
			select node from tree_bind where entity = ? and type = 1
		)
	`
	var nodes []db.Tree

	err := db.Select(ql, &nodes, user.UUID)
	if err != nil {
		return errors.Wrapf(err, "查询用户 %s 绑定节点错误", user.Name)
	}
	if len(nodes) == 1 {
		cc.SetNode(&nodes[0])
	}
	return nil
}
