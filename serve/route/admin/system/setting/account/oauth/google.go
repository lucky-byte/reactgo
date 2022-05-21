package oauth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func googleGet(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from oauth where provider = 'google'`
	var result []db.OAuth

	err := db.Select(ql, &result)
	if err != nil {
		cc.ErrLog(err).Error("查询 Google 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var oauth db.OAuth

	if len(result) == 0 {
		ql = `insert into oauth (provider, sortno) values ('google', 2)`

		err = db.ExecOne(ql)
		if err != nil {
			cc.ErrLog(err).Error("新增 Google 授权配置错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		oauth = result[0]
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": oauth.ClientId,
		"secret":   oauth.Secret,
		"enabled":  oauth.Enabled,
	})
}

func googleSet(c echo.Context) error {
	cc := c.(*ctx.Context)

	var clientid, secret string
	var enabled bool

	err := echo.FormFieldBinder(c).
		MustString("clientid", &clientid).
		MustString("secret", &secret).
		MustBool("enabled", &enabled).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&clientid, &secret)

	ql := `
		update oauth set clientid = ?, secret = ?, enabled = ?
		where provider = 'google'
	`
	if err = db.ExecOne(ql, clientid, secret, enabled); err != nil {
		cc.ErrLog(err).Error("更新 Google 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
