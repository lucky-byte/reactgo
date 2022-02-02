package resetpass

import (
	"github.com/labstack/echo/v4"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/resetpass")

	router.POST("/emailcode", emailcode)
	router.PUT("/emailverify", emailverify)
	router.PUT("/smsverify", smsVerify)
	router.POST("/smsresend", smsResend)
}
