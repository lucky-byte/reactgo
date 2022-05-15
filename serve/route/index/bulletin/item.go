package bulletin

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取单个公告
func item(c echo.Context) error {
	cc := c.(*ctx.Context)

	uuid := c.Param("uuid")

	ql := `
		select * from bulletins
		where status = 3 and is_public = true and uuid = ?
	`
	var result db.Bulletin

	err := db.SelectOne(ql, &result, uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询公告错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":      result.UUID,
		"create_at": result.CreateAt,
		"title":     result.Title,
		"content":   result.Content,
		"send_time": result.SendTime,
	})
}
