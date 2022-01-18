package manage

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

func updateinfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, name, email, mobile, address, company string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("name", &name).
		MustString("email", &email).
		MustString("mobile", &mobile).
		String("company", &company).
		String("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	// 清除前后空白字符
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(email)
	mobile = strings.TrimSpace(mobile)
	address = strings.TrimSpace(address)
	company = strings.TrimSpace(company)

	// 更新信息
	ql := `
		update bank_develops set
			name = ?, email = ?, mobile = ?, address = ?, company = ?,
			update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, name, email, mobile, address, company, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新渠道开发商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
