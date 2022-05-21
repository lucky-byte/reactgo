package secure

import (
	"encoding/hex"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/secure"
)

// 更换签名密钥
func jwtsignkey(c echo.Context) error {
	cc := c.(*ctx.Context)

	var method int

	err := echo.FormFieldBinder(c).MustInt("method", &method).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	k, err := secure.RandomBytes(16)
	if err != nil {
		cc.ErrLog(err).Error("生成安全随机数错")
		return c.NoContent(http.StatusInternalServerError)
	}
	key := hex.EncodeToString(k)

	// 新旧密钥同时有效
	if method == 1 {
		ql := `select jwtsignkey from account`
		var old string

		if err := db.SelectOne(ql, &old); err != nil {
			cc.ErrLog(err).Error("查询账号设置错")
			return c.NoContent(http.StatusInternalServerError)
		}
		ql = `update account set jwtsignkey = ?, jwtsignkey2 = ?`

		if err := db.ExecOne(ql, key, old); err != nil {
			cc.ErrLog(err).Error("更新账号设置错")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.String(http.StatusOK, key)
	}
	// 旧密钥立即失效
	if method == 2 {
		ql := `update account set jwtsignkey = ?, jwtsignkey2 = ?`

		if err = db.ExecOne(ql, key, key); err != nil {
			cc.ErrLog(err).Error("更新账号设置错")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.String(http.StatusOK, key)
	}
	return c.NoContent(http.StatusBadRequest)
}
