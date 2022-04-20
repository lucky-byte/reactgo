package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	uuid := c.QueryParam("uuid")
	if len(uuid) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		select create_at, update_at, code, name, summary
		from acl where uuid = ?
	`
	var acl db.ACL

	if err := db.SelectOne(ql, &acl, uuid); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询允许列表
	ql = `
		select code, title, iread, iwrite, iadmin from acl_allows
		where acl = ? order by code
	`
	var result []db.ACLAllow

	if err := db.Select(ql, &result, uuid); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	allows := []echo.Map{}

	for _, v := range result {
		allows = append(allows, echo.Map{
			"code":   v.Code,
			"title":  v.Title,
			"iread":  v.IRead,
			"iwrite": v.IWrite,
			"iadmin": v.IAdmin,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":      uuid,
		"create_at": acl.CreateAt,
		"update_at": acl.UpdateAt,
		"code":      acl.Code,
		"name":      acl.Name,
		"summary":   acl.Summary,
		"allows":    allows,
	})
}
