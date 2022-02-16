package settings

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings/account"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings/generic"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings/geoip"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings/mail"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings/sms"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/settings", acl.AllowRead(code))

	generic.Attach(group, code)
	sms.Attach(group, code)
	mail.Attach(group, code)
	geoip.Attach(group, code)
	account.Attach(group, code)
}
