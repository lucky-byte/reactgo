package oauth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func twitterGet(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from oauth where provider = 'twitter'`
	var result []db.OAuth

	err := db.Select(ql, &result)
	if err != nil {
		cc.ErrLog(err).Error("查询 Twitter 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var twitter db.OAuth

	if len(result) == 0 {
		ql = `insert into oauth (provider) values ('twitter')`

		err = db.ExecOne(ql)
		if err != nil {
			cc.ErrLog(err).Error("新增 Twitter 授权配置错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		twitter = result[0]
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": twitter.ClientId,
		"secret":   twitter.Secret,
		"enabled":  twitter.Enabled,
	})
}

func twitterSet(c echo.Context) error {
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
		where provider = 'twitter'
	`
	if err = db.ExecOne(ql, clientid, secret, enabled); err != nil {
		cc.ErrLog(err).Error("更新 Twitter 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
