package legal

import (
	_ "embed"
	"net/http"

	"github.com/labstack/echo/v4"
)

//go:embed privacy.html
var privacy_html string

//go:embed terms.html
var terms_html string

func Attach(e *echo.Echo) {
	// 隐私政策
	e.GET("/privacy", func(c echo.Context) error {
		return c.HTML(http.StatusOK, privacy_html)
	})

	// 服务条款
	e.GET("/terms", func(c echo.Context) error {
		return c.HTML(http.StatusOK, terms_html)
	})
}
