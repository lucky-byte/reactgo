package github

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

type profile struct {
	ID     json.Number `json:"id"`
	Email  string      `json:"email"`
	Login  string      `json:"login"`
	Name   string      `json:"name"`
	Avatar string      `json:"avatar_url"`
}

func callback(c echo.Context) error {
	cc := c.(*ctx.Context)

	errorHtml := func(status int, message string) error {
		return c.HTML(status, buildErrorHtml(message))
	}

	// Github 返回错误，例如用户拒绝授权等
	e := c.QueryParam("error")
	if len(e) > 0 {
		desc := c.QueryParam("error_description")
		return errorHtml(http.StatusBadRequest, fmt.Sprintf("%s: %s", e, desc))
	}
	var code, state string

	// code 和 state 是必须的参数
	err := echo.QueryParamsBinder(c).
		MustString("code", &code).MustString("state", &state).BindError()
	if err != nil {
		err = errors.Wrapf(err, "%s", c.Request().URL.String())
		cc.ErrLog(err).Error("GitHub 授权回调参数不完整")
		return errorHtml(http.StatusBadRequest, "授权回调参数错误")
	}
	// 检查 state 是否有效，如果无效，立即中断处理，state 在发起授权时生成
	ql := `
		select * from user_oauth
		where uuid = ? and status = 1 and provider = 'github'
	`
	var oauth db.UserOAuth

	err = db.SelectOne(ql, &oauth, state)
	if err != nil {
		cc.ErrLog(err).Error("查询 GitHub 授权记录错")
		return errorHtml(http.StatusBadRequest, "未查询到授权记录，请重试")
	}
	// 5 分钟内有效
	if oauth.CreateAt.Before(time.Now().Add(-5 * time.Minute)) {
		cc.Log().Error("GitHub 授权回调超时")
		return errorHtml(http.StatusRequestTimeout, "授权超出时间限制，请重试")
	}
	// 查询系统 GitHub 授权配置
	ql = `select * from oauth where provider = 'github'`
	var records []db.OAuth

	err = db.Select(ql, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询 GitHub 授权配置错")
		return errorHtml(http.StatusInternalServerError, "系统繁忙，请稍后重试")
	}
	if len(records) == 0 {
		cc.Log().Error("系统未配置 GitHub 身份授权参数，不能完成授权")
		return errorHtml(http.StatusForbidden, "系统配置不允许此操作")
	}
	github := records[0]

	if !github.Enabled || len(github.ClientId) == 0 || len(github.Secret) == 0 {
		cc.Log().Error("GitHub 授权配置不完整或未启用，不能完成授权")
		return errorHtml(http.StatusForbidden, "系统配置不允许此操作")
	}

	// 获取 access token
	form := url.Values{
		"client_id":     {github.ClientId},
		"client_secret": {github.Secret},
		"code":          {code},
	}
	res1, err := http.PostForm("https://github.com/login/oauth/access_token", form)
	if err != nil {
		cc.ErrLog(err).Error("获取 GitHub Access Token 错")
		return errorHtml(http.StatusBadRequest, "网络错误，请稍后重试")
	}
	defer res1.Body.Close()

	body, err := ioutil.ReadAll(res1.Body)
	if err != nil {
		cc.ErrLog(err).Error("读取 GitHub 响应数据错")
		return errorHtml(http.StatusUnprocessableEntity, "网络错误，请稍后重试")
	}
	v, err := url.ParseQuery(string(body))
	if err != nil {
		err = errors.Wrap(err, string(body))
		cc.ErrLog(err).Error("解析 GitHub 响应数据错")
		return errorHtml(http.StatusUnprocessableEntity, "网络错误，请稍后重试")
	}
	access_token := v.Get("access_token")

	if len(access_token) == 0 {
		err = errors.Wrap(err, string(body))
		cc.Log().Error("GitHub 响应缺少 access token")
		return errorHtml(http.StatusUnprocessableEntity, "网络错误，请稍后重试")
	}
	// 获取用户信息
	client := &http.Client{}

	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		cc.ErrLog(err).Error("创建 HTTP 客户端请求错")
		return errorHtml(http.StatusInternalServerError, "网络错误，请稍后重试")
	}
	req.Header.Set("Authorization", fmt.Sprintf("token %s", access_token))

	res2, err := client.Do(req)
	if err != nil {
		cc.ErrLog(err).Error("获取 GitHub 用户信息错")
		return errorHtml(http.StatusBadRequest, "网络错误，请稍后重试")
	}
	defer res2.Body.Close()

	body, err = ioutil.ReadAll(res2.Body)
	if err != nil {
		cc.ErrLog(err).Error("读取 GitHub 响应数据错")
		return errorHtml(http.StatusUnprocessableEntity, "网络错误，请稍后重试")
	}
	var p profile

	err = json.Unmarshal(body, &p)
	if err != nil {
		err = errors.Wrap(err, string(body))
		cc.ErrLog(err).Error("解析 GitHub 用户信息错")
		return errorHtml(http.StatusUnprocessableEntity, "网络错误，请稍后重试")
	}
	if len(p.ID.String()) == 0 || len(p.Email) == 0 || len(p.Login) == 0 {
		err = fmt.Errorf("%v", body)
		cc.ErrLog(err).Error("GitHub 用户信息缺少 id, email 或 login")
		return errorHtml(http.StatusUnprocessableEntity, "授权账号信息不完整")
	}
	if oauth.Usage == 1 { // 授权
		// 检查账号是否已授权给其他用户
		ql = `
			select count(*) from user_oauth
			where status = 2 and userid = ? and provider = 'github'
		`
		var count int

		err = db.SelectOne(ql, &count, p.ID.String())
		if err != nil {
			cc.ErrLog(err).Error("查询用户授权账号错")
			return errorHtml(http.StatusInternalServerError, "服务器内部错")
		}
		if count > 0 {
			cc.Log().Errorf("GitHub 账号 %s 已授权给其他用户", p.Email)
			return errorHtml(http.StatusConflict, "该 GitHub 账号已授权给其他用户")
		}
		// 查询用户已授权 GitHub 账号，不能授权多个
		ql = `
			select count(*) from user_oauth
			where user_uuid = ? and provider = 'github' and status = 2
		`
		err = db.SelectOne(ql, &count, oauth.UserUUID)
		if err != nil {
			cc.ErrLog(err).Error("查询用户 GitHub 授权账号错")
			return errorHtml(http.StatusInternalServerError, "系统繁忙，请稍候重试")
		}
		if count > 0 {
			cc.Log().Error("用户已存在 GitHub 授权账号，不能再次授权")
			return errorHtml(http.StatusForbidden, "已存在授权账号，本次授权无效")
		}
		// 更新记录
		ql = `
			update user_oauth set userid = ?, email = ?, login = ?, name = ?,
				avatar = ?, profile = ?, status = 2
			where uuid = ?
		`
		err = db.ExecOne(
			ql, p.ID.String(), p.Email, p.Login, p.Name, p.Avatar, body, state,
		)
		if err != nil {
			cc.ErrLog(err).Error("更新用户授权账号信息错")
			return errorHtml(http.StatusInternalServerError, "服务器内部错")
		}
	}
	// 返回授权成功网页
	target := cc.Config().ServerHttpURL()

	// Dev 模式下 target 设置为 *，这样可以避免开发时端口不同源的问题，但存在安全隐患
	if cc.Config().Dev() {
		target = "*"
	}
	return c.HTML(http.StatusOK, buildSuccessHtml(&p, state, target))
}
