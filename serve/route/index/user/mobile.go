package user

import (
	"net/http"
	"regexp"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func mobile(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	var mobile string

	err := echo.FormFieldBinder(c).MustString("mobile", &mobile).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&mobile)

	match, err := regexp.MatchString(`^1[0-9]{10}$`, mobile)
	if err != nil {
		cc.ErrLog(err).Error("验证手机号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if !match {
		return c.String(http.StatusBadRequest, "手机号格式错误")
	}

	ql := `
		update users set mobile = ?, update_at = current_timestamp
		where uuid = ?
	`
	if err = db.ExecOne(ql, mobile, user.UUID); err != nil {
		cc.ErrLog(err).Error("修改用户手机号失败")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
