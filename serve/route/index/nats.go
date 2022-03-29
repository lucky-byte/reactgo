package index

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

var counter = 0

// 查询 nats 配置信息
func nats(c echo.Context) error {
	cc := c.(*ctx.Context)

	counter += 1

	return c.JSON(http.StatusOK, echo.Map{
		"servers": cc.Config().NatsWebSocket(),
		"name":    fmt.Sprintf("%s-%d", cc.User().UserId, counter),
	})
}
