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
	"github.com/labstack/echo/v4/middleware"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/index/auth"
	"github.com/lucky-byte/reactgo/serve/route/index/resetpass"
	"github.com/lucky-byte/reactgo/serve/route/index/secretcode"
	"github.com/lucky-byte/reactgo/serve/route/index/signin"
	"github.com/lucky-byte/reactgo/serve/route/index/system"
	"github.com/lucky-byte/reactgo/serve/route/index/user"
)

func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/r")

	// CSRF token
	group.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSecure:   conf.ServerSecure(),
		CookieSameSite: http.SameSiteStrictMode,
		TokenLookup:    "header:X-Csrf-Token",
		Skipper: func(c echo.Context) bool {
			return false
		},
	}))

	signin.Attach(group)    // 登录
	resetpass.Attach(group) // 找回密码

	group.Use(auth.Authentication) // 用户认证

	group.GET("/nats", nats) // NATS 配置

	secretcode.Attach(group) // 验证安全码

	group.Use(opsMiddleware()) // 记录操作历史

	user.Attach(group)   // 用户设置
	system.Attach(group) // 系统管理
}

// 添加操作记录
func opsMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := c.(*ctx.Context)

			if strings.ToUpper(c.Request().Method) != http.MethodGet {
				req := c.Request()

				content_type := req.Header.Get("content-type")
				body := ""

				if strings.Index(content_type, "multipart/form-data") < 0 {
					b, err := io.ReadAll(req.Body)
					if err != nil {
						cc.ErrLog(err).Error("读请求 Body 错")
						return next(c)
					}
					req.Body.Close()
					req.Body = io.NopCloser(bytes.NewBuffer(b))

					if strings.Index(content_type, "x-www-form-urlencoded") >= 0 {
						params, err := url.ParseQuery(body)
						if err != nil {
							cc.ErrLog(err).Errorf("解析请求数据错 %s", body)
						} else {
							var m = make(map[string]any)

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
					} else {
						body = string(b)
					}
				}
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
