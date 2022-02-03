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

	var page, rows_per_page uint
	var keyword, acl string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows_per_page", &rows_per_page).
		MustString("acl", &acl).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows_per_page

	t := goqu.T("users")

	var where goqu.Expression = goqu.ExOr{
		"users.userid": goqu.Op{"ilike": keyword},
		"users.name":   goqu.Op{"ilike": keyword},
		"users.mobile": goqu.Op{"ilike": keyword},
		"users.email":  goqu.Op{"ilike": keyword},
	}
	if acl != "all" {
		where = goqu.And(where, goqu.Ex{"users.acl": acl})
	}

	// 查询用户总数
	b := db.From(t).Select(goqu.COUNT("*")).Where(where)
	ql, _, err := b.ToSQL()
	if err != nil {
		cc.ErrLog(err).Error("构造 SQL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var total int

	if err := db.SelectOne(ql, &total); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}

	// 查询用户列表
	b = db.From(t).
		Select(t.Col("*"), goqu.I("acl.name").As("acl_name")).
		LeftJoin(goqu.T("acl"), goqu.On(goqu.Ex{
			"users.acl": goqu.I("acl.uuid"),
		})).
		Where(where).
		Order(t.Col("create_at").Desc()).
		Offset(offset).Limit(rows_per_page)

	ql, _, err = b.ToSQL()
	if err != nil {
		cc.ErrLog(err).Error("构造 SQL 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	type rt struct {
		db.User
		AclName string `db:"acl_name"`
	}
	var result []rt

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var users []echo.Map

	for _, u := range result {
		users = append(users, echo.Map{
			"uuid":      u.UUID,
			"create_at": u.CreateAt,
			"update_at": u.UpdateAt,
			"userid":    u.UserId,
			"name":      u.Name,
			"email":     u.Email,
			"mobile":    u.Mobile,
			"acl":       u.ACL,
			"acl_name":  u.AclName,
			"disabled":  u.Disabled,
			"deleted":   u.Deleted,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"total": total, "users": users})
}
