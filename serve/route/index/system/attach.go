package system

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/system/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/system/bulletin"
	"github.com/lucky-byte/reactgo/serve/route/index/system/event"
	"github.com/lucky-byte/reactgo/serve/route/index/system/history"
	"github.com/lucky-byte/reactgo/serve/route/index/system/node"
	"github.com/lucky-byte/reactgo/serve/route/index/system/ops"
	"github.com/lucky-byte/reactgo/serve/route/index/system/setting"
	"github.com/lucky-byte/reactgo/serve/route/index/system/task"
	"github.com/lucky-byte/reactgo/serve/route/index/system/user"
)

const (
	menuCodeUser     = 9000
	menuCodeACL      = 9010
	menuCodeHistory  = 9020
	menuCodeOps      = 9025
	menuCodeSetting  = 9030
	menuCodeEvent    = 9040
	menuCodeTask     = 9050
	menuCodeNode     = 9060
	menuCodeBulletin = 9070
)

func Attach(up *echo.Group) {
	group := up.Group("/system")

	user.Attach(group, menuCodeUser)
	acl.Attach(group, menuCodeACL)
	history.Attach(group, menuCodeHistory)
	ops.Attach(group, menuCodeOps)
	setting.Attach(group, menuCodeSetting)
	event.Attach(group, menuCodeEvent)
	task.Attach(group, menuCodeTask)
	node.Attach(group, menuCodeNode)
	bulletin.Attach(group, menuCodeBulletin)
}
