package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	uuid := c.QueryParam("uuid")
	if len(uuid) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select code from acl where uuid = ?`
	var code int

	if err := db.SelectOne(ql, &code, uuid); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// code 0 是系统管理角色，不能删除
	if code == 0 {
		return c.String(http.StatusForbidden, "该角色不能删除")
	}
	// 查询是否有绑定的用户，如果有则不能删除
	ql = `select count(*) from users where acl = ?`
	var count int

	if err := db.SelectOne(ql, &count, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, "该角色已被用户绑定，不能删除")
	}
	ql = `delete from acl where uuid = ?`

	if err := db.ExecOne(ql, uuid); err != nil {
		cc.ErrLog(err).Error("删除访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent((http.StatusOK))
}
