package api

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

func Attach(engine *echo.Echo) {
	router := engine.Group("/api")

	// TODO: Authentication

	router.GET("/ping", func(c echo.Context) error {
		time.Sleep(5 * time.Second)
		type resp struct {
			message string
		}
		return c.JSON(http.StatusOK, &resp{
			message: "API pong",
		})
	})

}
