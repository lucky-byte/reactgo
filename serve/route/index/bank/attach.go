package bank

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/bank/manage"
)

func Attach(up *echo.Group) {
	group := up.Group("/bank")

	manage.Attach(group)
}
