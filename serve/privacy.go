package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func privacy(c echo.Context) error {
	return c.String(http.StatusOK, privacy_text)
}
