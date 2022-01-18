package merch

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

	var name, mobile, email, company, address string

	err := echo.FormFieldBinder(c).
		MustString("name", &name).
		MustString("mobile", &mobile).
		MustString("email", &email).
		String("company", &company).
		String("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		c.String(http.StatusBadRequest, "无效的请求")
	}
	// 清除前后空白字符
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(email)
	mobile = strings.TrimSpace(mobile)
	address = strings.TrimSpace(address)
	company = strings.TrimSpace(company)

	// 添加
	ql := `
		insert into merch_develops (uuid, name, mobile, email, company, address)
		values (?, ?, ?, ?, ?, ?)
	`
	err = db.ExecOne(ql, uuid.NewString(), name, mobile, email, company, address)
	if err != nil {
		cc.ErrLog(err).Error("添加商户拓展商错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
