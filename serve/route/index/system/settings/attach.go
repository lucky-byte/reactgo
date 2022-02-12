package settings

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/settings", acl.AllowRead(code))

	group.GET("/generic", genericConfig)
	group.GET("/mail", mailMTAList)
	group.GET("/mail/info", mailInfo)
	group.GET("/sms", smsConfig)
	group.GET("/secure", secureConfig)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.PUT("/mail/modify", mailModify)
	group.PUT("/mail/sort", mailSort)
	group.POST("/mail/test", mailTest)

	group.PUT("/sms/appid", smsAppid)
	group.PUT("/sms/secretid", smsSecretId)
	group.PUT("/sms/secretkey", smsSecretKey)
	group.PUT("/sms/sign", smsSign)
	group.PUT("/sms/msgid", smsMsgId)

	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.PUT("/generic/bugreport", bugreport)

	group.POST("/mail/add", mailAdd)
	group.DELETE("/mail/delete", mailDel, secretcode.Verify())
	group.GET("/mail/export", mailExport)
	group.POST("/mail/import", mailImport)

	group.POST("/sms/test", smsTest)

	group.PUT("/secure/resetpass", resetpass)
	group.PUT("/secure/duration", duration)
}
