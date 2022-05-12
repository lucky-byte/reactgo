package auth

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func Authentication(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		// 验证登录 TOKEN
		authToken := c.Request().Header.Get("x-auth-token")
		if len(authToken) == 0 {
			cc.Log().Error("认证失败, 请求缺少认证 TOKEN")
			return c.NoContent(http.StatusUnauthorized)
		}
		jwt, err := JWTParse(authToken)
		if err != nil {
			cc.ErrLog(err).Error("认证失败, 解析 TOKEN 错误")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 还未激活
		if !jwt.Activate {
			cc.Log().Error("认证失败, TOKEN 尚未激活, 可能还未完成 2FA 认证")
			return c.NoContent(http.StatusUnauthorized)
		}
		ql := `select * from users where uuid = ?`
		var user db.User

		// 查询用户信息
		if err = db.SelectOne(ql, &user, jwt.User); err != nil {
			cc.ErrLog(err).Error("认证失败, 未查询到用户信息")
			return c.NoContent(http.StatusUnauthorized)
		}
		// 检查用户状态
		if user.Disabled || user.Deleted {
			cc.Log().Errorf("认证失败, 用户 %s 已被禁用或删除", user.Name)
			return c.NoContent(http.StatusUnauthorized)
		}
		cc.SetUser(&user)

		// 查询用户访问控制角色是否含有 nologin 特征，如果有则不允许登录
		ql = `select * from acl where uuid = ?`
		var acl db.ACL

		err = db.SelectOne(ql, &acl, user.ACL)
		if err != nil {
			cc.ErrLog(err).Errorf("查询用户 %s 访问控制信息错", user.Name)
			return c.NoContent(http.StatusUnauthorized)
		}
		acl_features := strings.Split(acl.Features, ",")

		for i, feature := range acl_features {
			trimed := strings.TrimSpace(feature)

			if trimed == "nologin" {
				err = fmt.Errorf("访问控制角色 %s 含有 nologin 特征", acl.Name)
				cc.ErrLog(err).Errorf("用户 %s 所属角色不允许登录", user.Name)
				return c.NoContent(http.StatusUnauthorized)
			}
			acl_features[i] = trimed
		}
		cc.SetAclFeatures(acl_features)

		// 查询用户访问控制权限
		ql = `select * from acl_allows where acl = ?`
		var allows []db.ACLAllow

		if err = db.Select(ql, &allows, user.ACL); err != nil {
			cc.ErrLog(err).Errorf("查询用户 %s 访问控制错误", user.Name)
			return c.NoContent(http.StatusUnauthorized)
		}
		cc.SetAclAllows(allows)

		// 查询用户绑定的层级节点
		ql = `
			select * from tree where uuid = (
				select node from tree_bind where entity = ? and type = 1
			)
		`
		var nodes []db.Tree

		if err = db.Select(ql, &nodes, user.UUID); err != nil {
			cc.ErrLog(err).Errorf("查询用户 %s 绑定节点错误", user.Name)
			return c.NoContent(http.StatusUnauthorized)
		}
		if len(nodes) == 1 {
			cc.SetNode(&nodes[0])
		}
		return next(c)
	}
}
