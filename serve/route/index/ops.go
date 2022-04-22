package index

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

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加操作记录
func opsMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := c.(*ctx.Context)

			req := c.Request()

			// 忽略 GET 请求
			if strings.ToUpper(req.Method) == http.MethodGet {
				return next(c)
			}
			body, ok := readOpsBody(cc)
			if ok {
				ql := `
					insert into ops (uuid, user_uuid, method, url, body)
					values (?, ?, ?, ?, ?)
				`
				id := uuid.NewString()
				user := cc.User()

				err := db.ExecOne(ql, id, user.UUID, req.Method, req.URL.Path, body)
				if err != nil {
					cc.ErrLog(err).Error("添加操作记录错")
				}
			}
			return next(c)
		}
	}
}

func readOpsBody(cc *ctx.Context) (string, bool) {
	req := cc.Request()

	b, err := io.ReadAll(req.Body)
	if err != nil {
		cc.ErrLog(err).Error("读请求 Body 错")
		return "", true
	}
	req.Body.Close()
	req.Body = io.NopCloser(bytes.NewBuffer(b))

	content_type := req.Header.Get("content-type")

	// FormData 暂不处理
	if strings.Index(content_type, "multipart/form-data") >= 0 {
		return "`multipart/form-data`", true
	}
	body := string(b)

	// www-form-urlencoded 转换为更容易阅读的 JSON 格式
	if strings.Index(content_type, "x-www-form-urlencoded") >= 0 {
		params, err := url.ParseQuery(body)
		if err != nil {
			cc.ErrLog(err).Errorf("解析请求数据错 %s", body)
			return body, true
		}
		// 如果请求中带有 _noop=true，则不记录此操作
		if params.Get("_noop") == "true" {
			return "", false
		}
		var m = make(map[string]string)

		for k, i := range params {
			m[k] = strings.Join(i, ",")
		}
		s, err := json.MarshalIndent(m, "", "  ")
		if err != nil {
			cc.ErrLog(err).Error("JSON marshal 错")
		} else {
			body = fmt.Sprintf("```json\n%s\n```", s)
		}
	}
	return body, true
}
