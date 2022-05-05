package signin

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/signin/oauth"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/signin")

	router.GET("/settings", settings)
	router.PUT("/", signin)
	router.GET("/settings", settings)
	router.POST("/userid/code", useridCode)
	router.POST("/userid/search", useridSearch)
	router.PUT("/smsverify", smsVerify)
	router.POST("/smsresend", smsResend)
	router.PUT("/otpverify", otpVerify)

	oauth.Attach(router)
}
