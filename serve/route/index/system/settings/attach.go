package settings

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/acl"
)

func Attach(up *echo.Group) {
	code := 1300

	group := up.Group("/settings", acl.AllowRead(code))

	group.GET("/sms", smsSettings)
	group.GET("/secure", secure)

	group.Use(acl.AllowWrite(code))

	group.PUT("/sms/appid", smsAppid)
	group.PUT("/sms/secretid", smsSecretId)
	group.PUT("/sms/secretkey", smsSecretKey)
	group.PUT("/sms/sign", smsSign)
	group.PUT("/sms/msgid", smsMsgId)

	group.Use(acl.AllowAdmin(code))

	group.POST("/sms/test", smsTest)
	group.PUT("/secure/resetpass", resetpass)
}
