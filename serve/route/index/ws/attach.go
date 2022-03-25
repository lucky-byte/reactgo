package ws

import (
	"sync"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/route/index/ws/event"
)

var tickets sync.Map

func Attach(up *echo.Group) {
	group := up.Group("/ws")

	group.GET("/ticket", getTicket)

	event.Attach(group)
}

// 获取 getTicket
func getTicket(c echo.Context) error {
	return nil
}
