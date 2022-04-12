package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取最近通知
func last(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	ql := `
		select * from notifications where user_uuid = ?
		order by create_at, status
		limit 3
	`
	var result []db.Notification

	if err := db.Select(ql, &result, user.UUID); err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var records []echo.Map

	for _, n := range result {
		records = append(records, echo.Map{
			"uuid":      n.UUID,
			"create_at": n.CreateAt,
			"title":     n.Title,
			"content":   n.Content,
			"status":    n.Status,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": records})
}
