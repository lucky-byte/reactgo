package signin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 重新发送短信验证码
func resend(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mobile string

	err := echo.FormFieldBinder(c).MustString("mobile", &mobile).BindError()
	if err != nil {
		c.String(http.StatusBadRequest, "请求数据不完整")
	}
	// 获取登录TOKEN
	authToken := c.Request().Header.Get("x-auth-token")
	if len(authToken) == 0 {
		cc.Log().Error("请求缺少访问 TOKEN")
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	// 解析登录TOKEN
	jwt, err := auth.JWTParse(authToken)
	if err != nil {
		cc.ErrLog(err).Error("解析登录 TOKEN 错")
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	if len(jwt.User) == 0 {
		cc.Log().Error("登录 TOKEN.user 无效")
		return c.String(http.StatusBadRequest, "无效的请求")
	}
	// 重新发送验证码
	smsid, err := sms.SendCode(mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码错误")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, echo.Map{"smsid": smsid})
}
