package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func allowList(c echo.Context) error {
	cc := c.(*ctx.Context)

	acl := c.QueryParam("acl")
	if len(acl) == 0 {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		select uuid, code, title, read, write, admin from acl_allows
		where acl = ? order by code
	`
	var result []db.ACLAllow

	if err := db.Select(ql, &result, acl); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	allows := []echo.Map{}

	for _, v := range result {
		allows = append(allows, echo.Map{
			"uuid":  v.UUID,
			"code":  v.Code,
			"title": v.Title,
			"read":  v.Read,
			"write": v.Write,
			"admin": v.Admin,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"allows": allows})
}
