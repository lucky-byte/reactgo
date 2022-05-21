package otp

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/pquerna/otp/totp"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/lib/jwt2"
)

// 验证 TOTP 口令
func verify(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var code, historyid string
	var trust bool

	err := echo.FormFieldBinder(c).
		MustString("code", &code).
		Bool("trust", &trust).
		String("historyid", &historyid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&code, &historyid)

	// 验证 TOTP 口令
	if !totp.Validate(code, user.TOTPSecret) {
		return c.String(http.StatusBadRequest, "口令错误")
	}

	// 重新生成登录 TOKEN
	ql := `select sessduration from account`
	var duration time.Duration

	err = db.SelectOne(ql, &duration)
	if err != nil {
		cc.ErrLog(err).Error("查询设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	newJwt := jwt2.NewAuthJWT(user.UUID, true, duration*time.Minute)

	token, err := jwt2.JWTGenerate(newJwt)
	if err != nil {
		cc.ErrLog(err).Error("生成登录 TOKEN 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新历史记录
	if len(historyid) > 0 {
		ql = `update signin_history set trust = ?, tfa = 2 where uuid = ?`

		if err = db.ExecOne(ql, trust, historyid); err != nil {
			cc.ErrLog(err).Error("更新登录历史错")
		}
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token})
}
