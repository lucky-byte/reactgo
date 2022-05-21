package ops

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/exp/slices"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加操作记录
func Recorder(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		req := c.Request()

		// 忽略 GET 请求
		if strings.ToUpper(req.Method) == http.MethodGet {
			return next(c)
		}
		// 获取请求数据
		body, audit, noop := opsReadBody(cc)
		if noop {
			return next(c)
		}
		ql := `
			insert into ops (uuid, user_uuid, method, url, body, audit)
			values (?, ?, ?, ?, ?, ?)
		`
		id := uuid.NewString()
		user := cc.User()

		err := db.ExecOne(ql, id, user.UUID, req.Method, req.URL.Path, body, audit)
		if err != nil {
			cc.ErrLog(err).Error("添加操作记录错")
		}
		return next(c)
	}
}

// 不记录下面的敏感字段
var sensitiveKeys = []string{
	"secretcode_token",
	"password",
	"password2",
}

// 读取请求数据
func opsReadBody(cc *ctx.Context) (string, string, bool) {
	req := cc.Request()

	noop := false
	audit := ""

	marshalUrlValues := func(values url.Values) string {
		// 如果 _noop=true，则不记录此操作
		if values.Get("_noop") == "true" {
			noop = true
			return ""
		}
		var m = make(map[string]string)

		for k, v := range values {
			if k == "_audit" {
				audit = strings.Join(v, ",")
				continue
			}
			if slices.Contains(sensitiveKeys, k) {
				m[k] = "敏感信息已隐藏"
			} else {
				m[k] = strings.Join(v, ",")
			}
		}
		s, err := json.MarshalIndent(m, "", "  ")
		if err != nil {
			cc.ErrLog(err).Errorf("Marshal '%v'错", values)
			return ""
		}
		return fmt.Sprintf("```json\n%s\n```", s)
	}
	query := req.URL.RawQuery

	// 解析查询参数
	if len(req.URL.RawQuery) > 0 {
		q := marshalUrlValues(req.URL.Query())
		if noop {
			return "", "", noop
		}
		if len(q) > 0 {
			query = q
		}
	}
	content_type := req.Header.Get("content-type")

	// multipart/form-data 暂不处理
	if strings.Index(content_type, "multipart/form-data") >= 0 {
		return fmt.Sprintf("%s\n\n%s", query, "`multipart/form-data`"), audit, noop
	}

	// 读取 Body 数据，req.Body 是 ReadCloser，因此读之后需要重新初始化
	b, err := io.ReadAll(req.Body)
	if err != nil {
		cc.ErrLog(err).Error("读请求 Body 错")
		return query, audit, noop
	}
	req.Body.Close()
	req.Body = io.NopCloser(bytes.NewBuffer(b))

	body := string(b)

	// www-form-urlencoded 转换为更容易阅读的 JSON 格式
	if strings.Index(content_type, "x-www-form-urlencoded") >= 0 {
		values, err := url.ParseQuery(body)
		if err != nil {
			cc.ErrLog(err).Errorf("解析请求 Body 数据错 %s", body)
		} else {
			d := marshalUrlValues(values)
			if noop {
				return "", "", noop
			}
			if len(d) > 0 {
				body = d
			}
		}
	}
	return fmt.Sprintf("%s\n\n%s", query, body), audit, noop
}
