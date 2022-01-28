package signin

import (
	"github.com/labstack/echo/v4"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/signin")

	router.PUT("/", signin)
	router.PUT("/2fa", tfa)
	router.POST("/resend", resend)
}
