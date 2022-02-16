package signin

import (
	"github.com/labstack/echo/v4"
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
}
