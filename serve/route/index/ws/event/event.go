package event

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

var (
	upgrader = websocket.Upgrader{}
)

func event(c echo.Context) error {
	cc := c.(*ctx.Context)

	if !websocket.IsWebSocketUpgrade(c.Request()) {
		cc.Log().Error("不是升级请求")
		return c.NoContent(http.StatusBadRequest)
	}
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	for {
		// Write
		err := ws.WriteMessage(websocket.TextMessage, []byte("Hello, Client!"))
		if err != nil {
			c.Logger().Error(err)
		}

		// Read
		_, msg, err := ws.ReadMessage()
		if err != nil {
			c.Logger().Error(err)
		}
		fmt.Printf("%s\n", msg)
	}
}
