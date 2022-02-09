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
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("users", offset, rows)

	like := goqu.Or(
		pg.Col("userid").ILike(keyword),
		pg.Col("name").ILike(keyword),
		pg.Col("mobile").ILike(keyword),
		pg.Col("email").ILike(keyword),
	)
	if acl != "all" {
		pg.Where(like, pg.Col("acl").Eq(acl))
	} else {
		pg.Where(like)
	}
	acl_table := goqu.T("acl")

	pg.Join(acl_table, goqu.On(pg.Col("acl").Eq(acl_table.Col("uuid"))))

	pg.Select(pg.Col("*"),
		acl_table.Col("code").As("acl_code"),
		acl_table.Col("name").As("acl_name"),
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
	var users []echo.Map

	for _, u := range records {
		users = append(users, echo.Map{
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
	return c.JSON(http.StatusOK, echo.Map{"count": count, "users": users})
}
