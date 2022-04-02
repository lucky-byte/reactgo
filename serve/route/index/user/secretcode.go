package user

import (
	"net/http"
	"regexp"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/secure"
)

func scode(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var code string

	err := echo.FormFieldBinder(c).MustString("secretcode", &code).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	match, err := regexp.MatchString(`^[0-9]{6}$`, code)
	if err != nil {
		cc.ErrLog(err).Error("验证安全操作码错误")
		return c.NoContent(http.StatusInternalServerError)
	}
	if !match {
		return c.String(http.StatusBadRequest, "安全操作码必须是6位数字")
	}
	// 加密
	codeHash, err := secure.DefaultPHC().Hash(code)
	if err != nil {
		cc.ErrLog(err).Error("加密安全操作码错")
		return c.String(http.StatusForbidden, "加密错误")
	}
	ql := `
		update users set secretcode = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, codeHash, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改安全操作码失败")
		return c.String(http.StatusForbidden, "修改安全操作码失败")
	}
	return c.NoContent(http.StatusOK)
}
