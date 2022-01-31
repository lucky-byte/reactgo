package user

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/secure"
)

func passwd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, password string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("password", &password).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	// 删除前后空白字符
	cc.Trim(&password)

	// 更新信息
	passwdHash, err := secure.DefaultPHC().Hash(password)
	if err != nil {
		cc.ErrLog(err).Error("加密密码错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql := `
		update users set passwd = ?, update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, passwdHash, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
