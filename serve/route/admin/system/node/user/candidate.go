package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询可以绑定的用户
func candidate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var node string

	err := echo.QueryParamsBinder(c).MustString("node", &node).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `
		select * from users where uuid not in (
			select entity from tree_bind where node = ?
		) and disabled = false
		order by create_at desc
	`
	var records []db.User

	if err = db.Select(ql, &records, node); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(records) == 0 {
		return c.String(http.StatusNotFound, "没有可绑定的用户")
	}
	var list []echo.Map

	for _, u := range records {
		list = append(list, echo.Map{
			"uuid":      u.UUID,
			"create_at": u.CreateAt,
			"name":      u.Name,
			"userid":    u.UserId,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
