package index

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

var counter = 0

// 查询 nats 配置信息
func nats(c echo.Context) error {
	cc := c.(*ctx.Context)

	var servers []string

	for _, s := range cc.Config().NatsServers() {
		a := strings.Split(s, "://")
		if len(a) != 2 {
			cc.Log().Errorf("Nats 服务器 %s 格式错误", s)
			return c.NoContent(http.StatusInternalServerError)
		}
		if a[0] == "nats" {
			servers = append(servers, "ws://"+a[1])
		} else if a[0] == "tls" {
			servers = append(servers, "wss://"+a[1])
		} else {
			cc.Log().Errorf("Nats 服务器 %s 格式错误，scheme `%s` 无效", s, a[0])
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	counter += 1

	return c.JSON(http.StatusOK, echo.Map{
		"servers": servers,
		"name":    fmt.Sprintf("%s-%d", cc.User().UserId, counter),
	})
}
