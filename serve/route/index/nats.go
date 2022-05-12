package index

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

var counter = 0

// 查询 NATS 配置信息
func nats(c echo.Context) error {
	cc := c.(*ctx.Context)
	user := cc.User()

	counter += 1

	servers := cc.Config().NatsWebSocket()
	name := fmt.Sprintf("%s-%d", user.UserId, counter)

	return c.JSON(http.StatusOK, echo.Map{"servers": servers, "name": name})
}
