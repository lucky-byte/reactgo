package user

import (
	"fmt"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/index/acl"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
)

func Attach(up *echo.Group, code int) {
	group := up.Group("/user", acl.AllowRead(code))

	group.GET("/list", list)
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

// 是否允许修改用户信息
func isUpdatable(user_uuid string) (*db.User, error) {
	ql := `select * from users where uuid = ?`
	var user db.User

	if err := db.SelectOne(ql, &user, user_uuid); err != nil {
		return nil, err
	}
	if user.Disabled || user.Deleted {
		return nil, fmt.Errorf("用户已被禁用或删除，不能修改用户信息")
	}
	return &user, nil
}
