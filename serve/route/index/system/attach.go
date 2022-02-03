package system

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/system/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/system/history"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings"
	"github.com/lucky-byte/reactgo/serve/route/index/system/task"
	"github.com/lucky-byte/reactgo/serve/route/index/system/user"
)

func Attach(up *echo.Group) {
	group := up.Group("/system")

	user.Attach(group)
	acl.Attach(group)
	history.Attach(group)
	settings.Attach(group)
	task.Attach(group)
}
