package user

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/user", acl.AllowRead(code))

	group.POST("/list", list)
	group.GET("/profile", profile)
	group.GET("/info", infoGet)

	group.Use(acl.AllowWrite(code))

	group.PUT("/info", infoUpdate)
	group.PUT("/passwd", passwd)
	group.PUT("/acl", aclUpdate)

	group.Use(acl.AllowAdmin(code))

	group.POST("/add", add)
	group.POST("/clearsecretcode", clearSecretCode)
	group.POST("/cleartotp", clearTOTP)
	group.POST("/disable", disable)
	group.DELETE("/delete", del, secretcode.Verify())
}
