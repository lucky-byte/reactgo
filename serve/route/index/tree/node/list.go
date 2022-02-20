package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func list(c echo.Context) error {
	return c.NoContent(http.StatusOK)
}
