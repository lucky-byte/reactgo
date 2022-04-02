package secretcode

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/secure"
)

// 验证安全操作码
func verify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var secretcode string

	err := echo.FormFieldBinder(c).MustString("secretcode", &secretcode).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	user := cc.User()

	// 如果没有设置安全操作码，直接返回成功
	if len(user.SecretCode) == 0 {
		return c.String(http.StatusOK, "notoken")
	}

	// 验证
	phc, err := secure.ParsePHC(user.SecretCode)
	if err != nil {
		cc.ErrLog(err).Error("解析安全操作码失败")
		return c.String(http.StatusForbidden, "验证失败")
	}
	if err = phc.Verify(secretcode); err != nil {
		cc.ErrLog(err).Errorf("用户 %s 验证安全操作码失败", user.Name)
		return c.String(http.StatusForbidden, "验证失败")
	}
	// 生成验证 TOKEN
	token := genToken(user.UUID)

	return c.String(http.StatusOK, token)
}
