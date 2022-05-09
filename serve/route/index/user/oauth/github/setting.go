package github

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func setting(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	// 删除过期未授权的记录
	ql := `
		delete from user_oauth
		where provider = 'github' and status = 1 and create_at < ?
	`
	err := db.Exec(ql, time.Now().Add(-5*time.Minute))
	if err != nil {
		cc.ErrLog(err).Error("清理用户 GitHub 无效授权记录错")
	}

	// 查询 GitHub 授权系统配置
	ql = `select * from oauth where provider = 'github'`
	var records []db.OAuth

	err = db.Select(ql, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询 GitHub 授权配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var github db.OAuth

	if len(records) > 0 {
		github = records[0]
	}
	// 如果配置不完整，则不允许授权
	if len(github.ClientId) == 0 || len(github.Secret) == 0 {
		github.Enabled = false
	}
	// 查询用户已授权的 GitHub 账号
	ql = `
		select * from user_oauth
		where user_uuid = ? and provider = 'github' and status = 2
	`
	var accounts []db.UserOAuth

	err = db.Select(ql, &accounts, user.UUID)
	if err != nil {
		cc.ErrLog(err).Error("查询用户 GitHub 授权信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 不能授权多个 GitHub 账号
	if len(accounts) > 1 {
		cc.Log().Error("用户已授权多个 GitHub 账号???")
		return c.NoContent(http.StatusInternalServerError)
	}
	var account db.UserOAuth

	if len(accounts) == 1 {
		account = accounts[0]
	}
	return c.JSON(http.StatusOK, echo.Map{
		"clientid": github.ClientId,
		"enabled":  github.Enabled,
		"userid":   account.UserId,
		"email":    account.Email,
		"login":    account.Login,
		"name":     account.Name,
		"status":   account.Status,
		"avatar":   account.Avatar,
	})
}
