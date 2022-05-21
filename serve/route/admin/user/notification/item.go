package notification

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取单个通知
func item(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	uuid := c.Param("uuid")

	ql := `select * from notifications where user_uuid = ? and uuid = ?`
	var result db.Notification

	err := db.SelectOne(ql, &result, user.UUID, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询通知错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 如果是未读状态，改为已读状态
	if result.Status == 1 {
		ql := `update notifications set status = 2 where user_uuid = ? and uuid = ?`

		err := db.ExecOne(ql, user.UUID, uuid)
		if err != nil {
			cc.ErrLog(err).Error("更新通知错")
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":      result.UUID,
		"create_at": result.CreateAt,
		"type":      result.Type,
		"title":     result.Title,
		"content":   result.Content,
		"status":    result.Status,
	})
}
