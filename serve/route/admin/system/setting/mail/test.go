package mail

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/mailfs"
)

// 发送测试邮件
func test(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, email string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("email", &email).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 解析收件地址
	addr, err := mail.ParseAddress(email)
	if err != nil {
		cc.ErrLog(err).Error("解析邮件地址错")
		return c.String(http.StatusBadRequest, "解析邮件地址错")
	}
	// 查询 MTA 信息
	ql := `select * from mtas where uuid = ?`
	var mta db.MTA

	if err = db.SelectOne(ql, &mta, uuid); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 生成邮件
	m, err := mailfs.Message("测试邮件", "test", map[string]interface{}{
		"MTAName": mta.Name,
	})
	if err != nil {
		cc.ErrLog(err).Error("从模板生成邮件错")
		return c.NoContent(http.StatusInternalServerError)
	}
	m.AddTO(addr)

	// 发送邮件
	if err = m.SendWithMta(&mta); err != nil {
		cc.ErrLog(err).Error("发送邮件错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}
