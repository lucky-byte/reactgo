package google

import (
	"github.com/labstack/echo/v4"
)

func Attach(engine *echo.Group) {
	router := engine.Group("/google")

	router.PUT("/authorize", authorize)
	router.PUT("/signin", signin)
}
