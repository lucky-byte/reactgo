package oauth

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func githubInfo(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from oauth_github`
	var result db.OAuthGitHub

	if err := db.SelectOne(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询系统设置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": result.ClientId,
		"secret":   result.Secret,
		"enabled":  result.Enabled,
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

	ql := `update oauth_github set clientid = ?, secret = ?, enabled = ?`

	if err = db.ExecOne(ql, clientid, secret, enabled); err != nil {
		cc.ErrLog(err).Error("更新 GitHub 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
