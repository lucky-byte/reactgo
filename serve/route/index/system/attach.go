package system

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/system/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/system/history"
	"github.com/lucky-byte/reactgo/serve/route/index/system/notification"
	"github.com/lucky-byte/reactgo/serve/route/index/system/settings"
	"github.com/lucky-byte/reactgo/serve/route/index/system/task"
	"github.com/lucky-byte/reactgo/serve/route/index/system/user"
)

const (
	menuCodeUser         = 9000
	menuCodeACL          = 9010
	menuCodeHistory      = 9020
	menuCodeSettings     = 9030
	menuCodeNotification = 9040
	menuCodeTask         = 9050
)

func Attach(up *echo.Group) {
	group := up.Group("/system")

	user.Attach(group, menuCodeUser)
	acl.Attach(group, menuCodeACL)
	history.Attach(group, menuCodeHistory)
	settings.Attach(group, menuCodeSettings)
	notification.Attach(group, menuCodeNotification)
	task.Attach(group, menuCodeTask)
}
