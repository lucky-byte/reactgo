package user

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询用户列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var page, rows uint
	var keyword, acl string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustString("acl", &acl).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("users", offset, rows)

	pg.Where(goqu.Or(
		pg.Col("userid").ILike(keyword),
		pg.Col("name").ILike(keyword),
		pg.Col("mobile").ILike(keyword),
		pg.Col("email").ILike(keyword),
	))
	if acl != "all" {
		pg.Where(pg.Col("acl").Eq(acl))
	}
	aclTable := goqu.T("acl")

	pg.Join(aclTable, goqu.On(pg.Col("acl").Eq(aclTable.Col("uuid"))))

	pg.Select(pg.Col("*"),
		aclTable.Col("code").As("acl_code"),
		aclTable.Col("name").As("acl_name"),
	)
	pg.OrderBy(pg.Col("create_at").Desc())

	type record struct {
		db.User
		AclCode string `db:"acl_code"`
		AclName string `db:"acl_name"`
	}
	var count uint
	var records []record

	err = pg.Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, u := range records {
		list = append(list, echo.Map{
			"uuid":      u.UUID,
			"create_at": u.CreateAt,
			"update_at": u.UpdateAt,
			"userid":    u.UserId,
			"name":      u.Name,
			"email":     u.Email,
			"mobile":    u.Mobile,
			"n_signin":  u.NSignin,
			"signin_at": u.SigninAt,
			"acl":       u.ACL,
			"acl_name":  u.AclName,
			"acl_code":  u.AclCode,
			"disabled":  u.Disabled,
			"deleted":   u.Deleted,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
