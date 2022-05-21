package signin

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/login/signin/oauth"
	"github.com/lucky-byte/reactgo/serve/route/login/signin/otp"
	"github.com/lucky-byte/reactgo/serve/route/login/signin/sms"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/signin")

	router.GET("/settings", settings)
	router.PUT("/", signin)
	router.GET("/settings", settings)
	router.POST("/userid/code", useridCode)
	router.POST("/userid/search", useridSearch)

	sms.Attach(router)
	otp.Attach(router)
	oauth.Attach(router)
}
