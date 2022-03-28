package event

import (
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

// 通过 websocket 实时发布 event
func event(c echo.Context) error {
	// cc := c.(*ctx.Context)

	// if !websocket.IsWebSocketUpgrade(c.Request()) {
	// 	cc.Log().Error("不是升级请求")
	// 	return c.NoContent(http.StatusBadRequest)
	// }
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	for {
		// Write
		err = ws.WriteMessage(websocket.TextMessage, []byte("Hello, Client!"))
		if err != nil {
			c.Logger().Error(err)
		}
		time.Sleep(time.Second)

		// Read
		// _, msg, err := ws.ReadMessage()
		// if err != nil {
		// 	c.Logger().Error(err)
		// }
		// fmt.Printf("%s\n", msg)
	}
	// return nil
}
