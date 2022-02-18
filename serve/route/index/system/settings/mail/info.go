package mail

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询邮件传输代理信息
func info(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &mta_uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select * from mtas where uuid = ?`
	var result db.MTA

	if err := db.SelectOne(ql, &result, mta_uuid); err != nil {
		cc.ErrLog(err).Error("查询邮件传输代理错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":     result.UUID,
		"name":     result.Name,
		"host":     result.Host,
		"port":     result.Port,
		"sslmode":  result.SSLMode,
		"sender":   result.Sender,
		"prefix":   result.Prefix,
		"replyto":  result.ReplyTo,
		"username": result.Username,
		"passwd":   result.Passwd,
		"cc":       result.CC,
		"bcc":      result.BCC,
		"sortno":   result.SortNo,
		"nsent":    result.NSent,
	})
}
