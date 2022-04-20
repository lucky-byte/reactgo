package bulletin

import (
	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"

	"github.com/labstack/echo/v4"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/bulletin", acl.AllowRead(code))

	group.GET("/", list)

	group.Use(acl.AllowWrite(code))

	group.POST("/edit", edit)
	group.POST("/send", send)
	group.DELETE("/del", del, secretcode.Verify())

	// 如果是主服务器则启动发送
	if config.Master {
		sendAll()
	}
}
