package login

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/login/resetpass"
	"github.com/lucky-byte/reactgo/serve/route/login/signin"
)

// 登录相关模块
func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/login")

	signin.Attach(group)    // 登录
	resetpass.Attach(group) // 找回密码
}
