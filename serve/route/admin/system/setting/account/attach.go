package account

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/account/oauth"
	"github.com/lucky-byte/reactgo/serve/route/admin/system/setting/account/secure"
	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/account", acl.AllowRead(code))

	secure.Attach(group, code)
	oauth.Attach(group, code)
}
