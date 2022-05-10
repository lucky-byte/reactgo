package google

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

type endpoints struct {
	TokenEndpoint string `json:"token_endpoint"`
}

type tokenRes struct {
	AccessToken      string `json:"access_token"`
	IdToken          string `json:"id_token"`
	ExpiresIn        int    `json:"expires_in"`
	Scope            string `json:"scope"`
	TokenType        string `json:"token_type"`
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

type idToken struct {
	Aud     string `json:"aud"`
	Iss     string `json:"iss"`
	Sub     string `json:"sub"`
	Azp     string `json:"azp"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Locale  string `json:"locale"`
}

func callback(c echo.Context) error {
	cc := c.(*ctx.Context)

	errorHtml := func(status int, message string) error {
		return c.HTML(status, buildErrorHtml(message))
	}
	var code, state string

	// code 和 state 是必须的参数
	err := echo.QueryParamsBinder(c).
		MustString("code", &code).MustString("state", &state).BindError()
	if err != nil {
		err = errors.Wrapf(err, "%s", c.Request().URL.String())
		cc.ErrLog(err).Error("Google 授权回调参数不完整")
		return errorHtml(http.StatusBadRequest, "授权回调参数错误")
	}
	// 检查 state 是否有效，如果无效，立即中断处理，state 在发起授权时生成
	ql := `
		select * from user_oauth
		where uuid = ? and status = 1 and provider = 'google'
	`
	var oauth db.UserOAuth

	err = db.SelectOne(ql, &oauth, state)
	if err != nil {
		cc.ErrLog(err).Error("查询 Google 授权记录错")
		return errorHtml(http.StatusBadRequest, "未查询到授权记录，请重试")
	}
	// 5 分钟内有效
	if oauth.CreateAt.Before(time.Now().Add(-5 * time.Minute)) {
		cc.Log().Error("Google 授权回调超时")
		return errorHtml(http.StatusRequestTimeout, "授权超出时间限制，请重试")
	}
	// 查询系统 Google 授权配置
	ql = `select * from oauth where provider = 'google'`
	var records []db.OAuth

	err = db.Select(ql, &records)
	if err != nil {
		cc.ErrLog(err).Error("查询 Google 授权配置错")
		return errorHtml(http.StatusInternalServerError, "系统繁忙，请稍后重试")
	}
	if len(records) == 0 {
		cc.Log().Error("系统未配置 Google 身份授权参数，不能完成授权")
		return errorHtml(http.StatusForbidden, "系统配置不允许此操作")
	}
	google := records[0]

	if !google.Enabled || len(google.ClientId) == 0 || len(google.Secret) == 0 {
		cc.Log().Error("Google 授权配置不完整或未启用，不能完成授权")
		return errorHtml(http.StatusForbidden, "系统配置不允许此操作")
	}
	// 查询 discovery 配置
	dc, err := discovery()
	if err != nil {
		cc.ErrLog(err).Error("获取 Google Discovery 配置错")
		return errorHtml(http.StatusBadRequest, "网络错误，请稍后重试")
	}
	baseurl := cc.Config().ServerHttpURL()

	// 获取 Id Token
	t, p, err := getIdToken(&google, code, baseurl, dc)
	if err != nil {
		cc.ErrLog(err).Error("获取 Google Tokens 错")
		return errorHtml(http.StatusBadRequest, "网络错误，请稍后重试")
	}
	// 如果是授权，将 Google 账号绑定到用户
	if oauth.Usage == 1 {
		// 检查 Google 账号是否已授权给其他用户
		ql = `
			select count(*) from user_oauth
			where status = 2 and userid = ? and provider = 'google'
		`
		var count int

		err = db.SelectOne(ql, &count, t.Sub)
		if err != nil {
			cc.ErrLog(err).Error("查询用户授权账号错")
			return errorHtml(http.StatusInternalServerError, "服务器内部错")
		}
		if count > 0 {
			cc.Log().Errorf("Google 账号 %s 已授权给其他用户", t.Email)
			return errorHtml(http.StatusConflict, "该 Google 账号已授权给其他用户")
		}
		// 查询用户已授权 Google 账号，不能授权多个
		ql = `
			select count(*) from user_oauth
			where user_uuid = ? and provider = 'google' and status = 2
		`
		err = db.SelectOne(ql, &count, oauth.UserUUID)
		if err != nil {
			cc.ErrLog(err).Error("查询用户 Google 授权账号错")
			return errorHtml(http.StatusInternalServerError, "系统繁忙，请稍候重试")
		}
		if count > 0 {
			cc.Log().Error("用户已存在 Google 授权账号，不能再次授权")
			return errorHtml(http.StatusForbidden, "已存在授权账号，本次授权无效")
		}
		// 更新记录
		ql = `
			update user_oauth set userid = ?, email = ?, login = ?, name = ?,
				avatar = ?, profile = ?, status = 2
			where uuid = ?
		`
		err = db.ExecOne(
			ql, t.Sub, t.Email, t.Email, t.Name, t.Picture, p, state,
		)
		if err != nil {
			cc.ErrLog(err).Error("更新用户授权账号信息错")
			return errorHtml(http.StatusInternalServerError, "服务器内部错")
		}
	}
	// 如果是登录，记录授权信息，登录时进行匹配
	if oauth.Usage == 2 {
		ql = `update user_oauth set userid = ?, email = ?, login = ? where uuid = ?`

		err = db.ExecOne(ql, t.Sub, t.Email, t.Email, state)
		if err != nil {
			cc.ErrLog(err).Error("更新用户授权账号信息错")
			return errorHtml(http.StatusInternalServerError, "服务器内部错")
		}
	}
	// 返回授权成功网页
	// Dev 模式下 target 设置为 *，这样可以避免开发时端口不同源的问题(存在安全隐患)
	if cc.Config().Dev() {
		baseurl = "*"
	}
	return c.HTML(http.StatusOK, buildSuccessHtml(t, state, baseurl))
}

// 查询 discovery 配置
func discovery() (*endpoints, error) {
	res, err := http.Get("https://accounts.google.com/.well-known/openid-configuration")
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	var d endpoints

	err = json.Unmarshal(body, &d)
	if err != nil {
		return nil, errors.Wrap(err, string(body))
	}
	if len(d.TokenEndpoint) == 0 {
		return nil, fmt.Errorf("Google Discovery 配置缺少 token_endpoint: %s", body)
	}
	return &d, nil
}

// 获取 tokens
func getIdToken(google *db.OAuth, code, uri string, dc *endpoints) (*idToken, string, error) {
	redirect_uri := uri + "/oauth/google/callback"

	form := url.Values{
		"code":          {code},
		"client_id":     {google.ClientId},
		"client_secret": {google.Secret},
		"redirect_uri":  {redirect_uri},
		"grant_type":    {"authorization_code"},
	}
	res, err := http.PostForm(dc.TokenEndpoint, form)
	if err != nil {
		return nil, "", err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, "", err
	}
	var t tokenRes

	err = json.Unmarshal(body, &t)
	if err != nil {
		return nil, "", errors.Wrap(err, string(body))
	}
	if len(t.Error) > 0 {
		return nil, "", fmt.Errorf("%s: %s", t.Error, t.ErrorDescription)
	}
	if len(t.IdToken) == 0 {
		return nil, "", fmt.Errorf("Google 响应缺少 id_token: %s", body)
	}
	arr := strings.Split(t.IdToken, ".")
	if len(arr) != 3 {
		return nil, "", fmt.Errorf("ID Token 不是有效的 JWT: %s", t.IdToken)
	}
	decoded, err := base64.RawURLEncoding.DecodeString(arr[1])
	if err != nil {
		return nil, "", err
	}
	var i idToken

	err = json.Unmarshal(decoded, &i)
	if err != nil {
		return nil, "", errors.Wrap(err, string(decoded))
	}
	return &i, string(decoded), nil
}
