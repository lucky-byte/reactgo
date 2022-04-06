package bulletin

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加
func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var title, content string
	var draft bool

	err := echo.FormFieldBinder(c).
		MustString("title", &title).
		MustString("content", &content).
		MustBool("draft", &draft).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&title, &content)

	ql := `
		insert into bulletins (uuid, title, content, draft)
		values (?, ?, ?, ?)
	`
	err = db.ExecOne(ql, uuid.NewString(), title, content, draft)
	if err != nil {
		cc.ErrLog(err).Error("添加公告记录错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
