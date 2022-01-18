package acl

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select uuid, code, name, summary from acl order by create_at desc`
	var result []db.ACL

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var acls []echo.Map

	for _, r := range result {
		acls = append(acls, echo.Map{
			"uuid":    r.UUID,
			"code":    r.Code,
			"name":    r.Name,
			"summary": r.Summary,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"acls": acls})
}
