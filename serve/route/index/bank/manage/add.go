package manage

import (
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func add(c echo.Context) error {
	cc := c.(*ctx.Context)

	var code, name, fullname, contact, mobile, email, address, develop string

	err := echo.FormFieldBinder(c).
		MustString("code", &code).
		MustString("name", &name).
		MustString("fullname", &fullname).
		MustString("contact", &contact).
		MustString("mobile", &mobile).
		MustString("email", &email).
		MustString("develop", &develop).
		String("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		c.String(http.StatusBadRequest, "无效的请求")
	}
	code = strings.TrimSpace(code)
	name = strings.TrimSpace(name)
	fullname = strings.TrimSpace(fullname)
	contact = strings.TrimSpace(contact)
	email = strings.TrimSpace(email)
	mobile = strings.TrimSpace(mobile)
	address = strings.TrimSpace(address)

	// 添加
	ql := `
		insert into banks (
			uuid, code, name, fullname, contact, mobile, email, address, develop
		)
		values (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		code, name, fullname, contact, mobile, email, address, develop,
	)
	if err != nil {
		cc.ErrLog(err).Error("添加渠道错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
