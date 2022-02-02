package index

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/route/index/resetpass"
	"github.com/lucky-byte/reactgo/serve/route/index/signin"
	"github.com/lucky-byte/reactgo/serve/route/index/system"
	"github.com/lucky-byte/reactgo/serve/route/index/user"
)

func Attach(up *echo.Echo) {
	group := up.Group("/r")

	signin.Attach(group)
	resetpass.Attach(group)

	group.Use(auth.Authentication)

	user.Attach(group)
	system.Attach(group)
}
