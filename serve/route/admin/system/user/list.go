package user

import (
	"fmt"
	"net/http"

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

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		String("acl", &acl).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&keyword, &acl)

	search := fmt.Sprintf("%%%s%%", keyword)
	offset := page * rows

	pg := db.NewPagination("users", offset, rows)

	// 关键字匹配
	if len(keyword) > 0 {
		pg.Where(goqu.Or(
			pg.Col("userid").ILike(search),
			pg.Col("name").ILike(search),
			pg.Col("mobile").ILike(search),
			pg.Col("email").ILike(search),
			pg.Col("idno").ILike(search),
			pg.Col("address").ILike(search),
			pg.Col("acct_bank_name").ILike(search),
		))
	}
	// 如果不是超级用户，则不能查询超级用户
	if cc.Acl().Code != 0 {
		ql := `select uuid from acl where code <> 0`
		var uuids []string

		err = db.Select(ql, &uuids)
		if err != nil {
			cc.ErrLog(err).Error("查询访问控制列表错")
			return c.NoContent(http.StatusInternalServerError)
		}
		pg.Where(pg.Col("acl").In(uuids))
	}
	// 访问控制匹配
	if len(acl) > 0 && acl != "all" {
		pg.Where(pg.Col("acl").Eq(acl))
	}
	aclTable := goqu.T("acl")

	// 连表查询 ACL 名称和代码
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
			"avatar":    u.Avatar,
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
