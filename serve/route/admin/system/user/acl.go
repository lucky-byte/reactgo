package user

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func aclUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, acl string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).MustString("acl", &acl).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 不允许修改自己的访问权限
	if cc.User().UUID == uuid {
		return c.String(http.StatusForbidden, "不可以修改自己的访问控制权限")
	}
	// 检查是否可修改
	user, err := isUpdatable(uuid)
	if err != nil {
		cc.ErrLog(err).Error("修改用户 ACL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql := `select * from acl where uuid = ?`
	var userAcl db.ACL

	// 查询目标用户当前的访问控制角色
	db.SelectOne(ql, &userAcl, user.ACL)
	if err != nil {
		cc.ErrLog(err).Error("查询用户访问控制权限错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果目标用户当前的访问控制角色为系统管理，那么当前用户的角色也必须是系统管理
	if userAcl.Code == 0 && cc.Acl().Code != 0 {
		err = fmt.Errorf(
			"目标用户 %s 的访问控制角色为 %s，但当前用户 %s 的访问控制角色是 %s",
			user.Name, userAcl.Name, cc.User().Name, cc.Acl().Name,
		)
		cc.ErrLog(err).Warnf(
			"%s 尝试修改用户 %s 的访问控制角色被拒绝", cc.User().Name, user.Name,
		)
		return c.String(http.StatusForbidden, "不能修改用户的访问控制权限，权限不足")
	}

	ql = `update users set acl = ?, update_at = current_timestamp where uuid = ?`

	// 更新
	err = db.ExecOne(ql, acl, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户访问控制权限错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
