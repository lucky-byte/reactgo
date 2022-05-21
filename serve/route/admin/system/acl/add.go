package acl

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var name, summary string

	err := echo.FormFieldBinder(c).
		MustString("name", &name).
		MustString("summary", &summary).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&name, &summary)

	ql := `select count(*) from acl where name = ?`
	var count int

	if err = db.SelectOne(ql, &count, name); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("%s 已存在", name))
	}
	ql = `
		insert into acl (uuid, code, name, summary, features)
		values (?, ?, ?, ?, '')
	`
	rand.Seed(time.Now().UnixNano())
	code := rand.Intn(10000)

	err = db.ExecOne(ql, uuid.NewString(), code, name, summary)
	if err != nil {
		cc.ErrLog(err).Error("添加访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
