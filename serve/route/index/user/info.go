package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
)

// 查询用户资料
func info(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	allows := []echo.Map{}

	for _, v := range cc.Allows() {
		allows = append(allows, echo.Map{
			"code":  v.Code,
			"read":  v.Read,
			"write": v.Write,
			"admin": v.Admin,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"userid":           user.UserId,
		"name":             user.Name,
		"email":            user.Email,
		"mobile":           user.Mobile,
		"address":          user.Address.String,
		"secretcode_isset": len(user.SecretCode) > 0,
		"totp_isset":       len(user.TOTPSecret) > 0,
		"allows":           allows,
	})
}
