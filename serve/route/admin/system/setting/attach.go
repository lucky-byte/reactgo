package setting

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/acl"
	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/account"
	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/geoip"
	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/mail"
	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/sms"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/setting", acl.AllowRead(code))

	mail.Attach(group, code)
	sms.Attach(group, code)
	geoip.Attach(group, code)
	account.Attach(group, code)
}
