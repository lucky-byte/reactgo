package image

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/config"
)

func Attach(engine *echo.Echo, conf *config.ViperConfig) {
	router := engine.Group("/image")

	router.GET("/", get)
}
