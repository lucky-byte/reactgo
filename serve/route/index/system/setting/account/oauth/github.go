package oauth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func githubGet(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from oauth where provider = 'github'`
	var result []db.OAuth

	err := db.Select(ql, &result)
	if err != nil {
		cc.ErrLog(err).Error("查询 GitHub 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var github db.OAuth

	if len(result) == 0 {
		ql = `insert into oauth (provider) values ('github')`

		err = db.ExecOne(ql)
		if err != nil {
			cc.ErrLog(err).Error("新增 GitHub 授权配置错")
			return c.NoContent(http.StatusInternalServerError)
		}
	} else {
		github = result[0]
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": github.ClientId,
		"secret":   github.Secret,
		"enabled":  github.Enabled,
	})
}

func githubSet(c echo.Context) error {
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
		where provider = 'github'
	`
	if err = db.ExecOne(ql, clientid, secret, enabled); err != nil {
		cc.ErrLog(err).Error("更新 GitHub 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
