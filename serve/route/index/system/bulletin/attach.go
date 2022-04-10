package bulletin

import (
	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
	"github.com/lucky-byte/reactgo/serve/xlog"

	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/bulletin", acl.AllowRead(code))

	group.POST("/", list)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.DELETE("/del", del, secretcode.Verify())

	// 如果是主服务器则启动定时任务
	if config.Master {
		xlog.X.Info("master herer........")
	}
}
