package google

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func authorize(c echo.Context) error {
	cc := c.(*ctx.Context)

	// 查询系统 Google 授权配置
	ql := `select * from oauth where provider = 'google'`
	var records []db.OAuth

	err := db.Select(ql, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询 Google 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if len(records) == 0 {
		cc.Log().Error("系统未配置 Google 身份授权，不能完成授权")
		return c.NoContent(http.StatusInternalServerError)
	}
	oauth := records[0]

	if !oauth.Enabled || len(oauth.ClientId) == 0 || len(oauth.Secret) == 0 {
		cc.Log().Error("Google 授权配置不完整或未启用，不能完成授权")
		return c.NoContent(http.StatusInternalServerError)
	}
	httpurl := cc.Config().ServerHttpURL()

	if len(httpurl) == 0 {
		cc.Log().Error("未配置 Server Http URL")
		return c.NoContent(http.StatusInternalServerError)
	}
	url := httpurl + "/oauth/google/callback"

	// 插入未授权的记录
	ql = `
		insert into user_oauth (uuid, user_uuid, provider, usage)
		values (?, ?, ?, 2)
	`
	state := uuid.NewString()

	if err := db.ExecOne(ql, state, "", "google"); err != nil {
		cc.ErrLog(err).Error("记录 user oauth 错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": oauth.ClientId, "state": state, "url": url,
	})
}
