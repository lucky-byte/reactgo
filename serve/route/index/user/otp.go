package user

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/pquerna/otp/totp"
)

// URL
func otpURL(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "lucky-byte.com",
		AccountName: user.UserId,
	})
	if err != nil {
		cc.ErrLog(err).Error("创建 TOTP KEY 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"url":    key.URL(),
		"secret": key.Secret(),
	})
}

// 验证
func otpVerify(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var code, secret string

	err := echo.FormFieldBinder(c).
		MustString("code", &code).
		MustString("secret", &secret).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 验证
	if !totp.Validate(code, secret) {
		return c.String(http.StatusBadRequest, "两因素认证口令验证失败")
	}
	ql := `update users set totp_secret = ? where uuid = ?`

	if err = db.ExecOne(ql, secret, user.UUID); err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
