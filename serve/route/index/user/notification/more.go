package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取通知列表
func more(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var page int
	rows_per_page := 3

	err := echo.FormFieldBinder(c).MustInt("page", &page).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	offset := (page - 1) * rows_per_page

	ql := `
		select * from notifications where user_uuid = ?
		order by create_at desc, status
		offset ? limit ?
	`
	var result []db.Notification

	err = db.Select(ql, &result, user.UUID, offset, rows_per_page)
	if err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, n := range result {
		list = append(list, echo.Map{
			"uuid":      n.UUID,
			"create_at": n.CreateAt,
			"type":      n.Type,
			"title":     n.Title,
			"content":   n.Content,
			"status":    n.Status,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"list": list, "has_more": len(result) == rows_per_page,
	})
}
