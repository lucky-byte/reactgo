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

	acl_allows := []echo.Map{}

	for _, v := range cc.AclAllows() {
		acl_allows = append(acl_allows, echo.Map{
			"code":   v.Code,
			"iread":  v.IRead,
			"iwrite": v.IWrite,
			"iadmin": v.IAdmin,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":             user.UUID,
		"userid":           user.UserId,
		"avatar":           user.Avatar,
		"name":             user.Name,
		"email":            user.Email,
		"mobile":           user.Mobile,
		"address":          user.Address,
		"secretcode_isset": len(user.SecretCode) > 0,
		"totp_isset":       len(user.TOTPSecret) > 0,
		"noti_popup":       user.NotiPopup,
		"noti_browser":     user.NotiBrowser,
		"noti_mail":        user.NotiMail,
		"acl_features":     cc.AclFeatures(),
		"acl_allows":       acl_allows,
	})
}
