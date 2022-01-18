package image

import (
	"github.com/labstack/echo/v4"
)

func Attach(engine *echo.Echo) {
	router := engine.Group("/image")

	// Get image
	router.GET("/", get)
}
