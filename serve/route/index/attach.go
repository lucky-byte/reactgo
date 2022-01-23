package index

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/route/index/auth"
	"github.com/lucky-byte/bdb/serve/route/index/signin"
	"github.com/lucky-byte/bdb/serve/route/index/system"
	"github.com/lucky-byte/bdb/serve/route/index/user"
)

func Attach(up *echo.Echo) {
	group := up.Group("/r")

	signin.Attach(group)

	group.Use(auth.Authentication)

	user.Attach(group)
	system.Attach(group)
}
