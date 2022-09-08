package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `
		select a.*, (
			select count(*) from users where acl = a.uuid
		) as user_count
		from acl as a
		order by a.create_at desc
	`
	if cc.Acl().Code != 0 {
		ql = `
			select a.*, (
				select count(*) from users where acl = a.uuid
			) as user_count
			from acl as a
			where a.code <> 0
			order by a.create_at desc
		`
	}
	type result struct {
		db.ACL
		UserCount int `db:"user_count"`
	}
	var records []result

	err := db.Select(ql, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var acls []echo.Map

	for _, r := range records {
		acls = append(acls, echo.Map{
			"uuid":      r.UUID,
			"code":      r.Code,
			"name":      r.Name,
			"summary":   r.Summary,
			"features":  r.Features,
			"usercount": r.UserCount,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"acls": acls})
}
