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

// 查询节点已绑定用户
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var page, rows uint
	var keyword, node string

	err := echo.QueryParamsBinder(c).
		MustUint("page", &page).
		MustUint("rows", &rows).
		MustString("node", &node).
		String("keyword", &keyword).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))
	offset := page * rows

	pg := db.NewPagination("tree_bind", offset, rows)

	userTable := goqu.T("users")

	pg.Join(userTable, goqu.On(pg.Col("entity").Eq(userTable.Col("uuid"))))

	pg.Where(pg.Col("type").Eq(1), pg.Col("node").Eq(node))
	pg.Where(goqu.Or(
		userTable.Col("name").ILike(keyword),
		userTable.Col("userid").ILike(keyword),
	))
	pg.Select(pg.Col("*"),
		userTable.Col("name").As("user_name"),
		userTable.Col("userid").As("userid"),
	)
	pg.OrderBy(pg.Col("create_at").Desc())

	type record struct {
		db.TreeBind
		UserName string `db:"user_name"`
		Userid   string `db:"userid"`
	}
	var count uint
	var records []record

	err = pg.Exec(&count, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询节点绑定用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, u := range records {
		list = append(list, echo.Map{
			"uuid":      u.UUID,
			"create_at": u.CreateAt,
			"user_name": u.UserName,
			"userid":    u.Userid,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"count": count, "list": list})
}
