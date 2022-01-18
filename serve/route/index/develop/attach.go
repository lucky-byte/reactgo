package develop

import (
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/bdb/serve/route/index/develop/bank"
	"github.com/lucky-byte/bdb/serve/route/index/develop/merch"
)

func Attach(up *echo.Group) {
	group := up.Group("/develop")

	bank.Attach(group)
	merch.Attach(group)
}
