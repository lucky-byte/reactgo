package secure

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/secure", acl.AllowRead(code))

	group.GET("/", info)

	group.Use(acl.AllowWrite(code)) // Write 权限

	group.POST("/signupable", signupable)
	group.POST("/signupacl", signupacl)
	group.POST("/lookuserid", lookuserid)
	group.POST("/resetpass", resetpass)
	group.POST("/duration", duration)

	group.Use(acl.AllowAdmin(code)) // Admin 权限

	group.PUT("/jwtsignkey", jwtsignkey, secretcode.Verify())
}
