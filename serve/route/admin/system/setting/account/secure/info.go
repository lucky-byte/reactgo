package secure

import (
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `
		select a.*, acl.name as acl_name
		from account as a
		left join acl as acl on acl.uuid = a.signupacl
	`
	type result struct {
		db.Account
		AclName sql.NullString `db:"acl_name"`
	}
	var record result

	if err := db.SelectOne(ql, &record); err != nil {
		cc.ErrLog(err).Error("查询账号设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"signupable":    record.Signupable,
		"signupacl":     record.SignupACL,
		"signupaclname": record.AclName.String,
		"lookuserid":    record.LookUserid,
		"resetpass":     record.ResetPass,
		"sessduration":  record.SessDuration,
		"jwtsignkey":    record.JWTSignKey,
	})
}
