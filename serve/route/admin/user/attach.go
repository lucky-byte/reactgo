package user

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/admin/user/notification"
	"github.com/lucky-byte/reactgo/serve/route/admin/user/oauth"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

func Attach(up *echo.Group) {
	group := up.Group("/user")

	group.GET("/info", info)
	group.GET("/devices", devices)
	group.GET("/geo", geo)
	group.GET("/signinlist", signinlist)
	group.PUT("/avatar", avatar)
	group.PUT("/name", name)
	group.PUT("/userid", userid, secretcode.Verify())
	group.PUT("/email", email, secretcode.Verify())
	group.PUT("/mobile", mobile, secretcode.Verify())
	group.PUT("/passwd", passwd, secretcode.Verify())
	group.PUT("/address", address, secretcode.Verify())
	group.PUT("/secretcode", scode, secretcode.Verify())
	group.GET("/otp/url", otpURL)
	group.POST("/otp/verify", otpVerify, secretcode.Verify())

	oauth.Attach(group)
	notification.Attach(group)
}
