package account

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/system/setting/account/oauth"
	"github.com/lucky-byte/reactgo/serve/route/index/system/setting/account/secure"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/account", acl.AllowRead(code))

	secure.Attach(group, code)
	oauth.Attach(group, code)
}
