package bulletin

import (
	"sync"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/route/lib/acl"
	"github.com/lucky-byte/reactgo/serve/route/lib/secretcode"
	"github.com/lucky-byte/reactgo/serve/xlog"

	"github.com/labstack/echo/v4"
)

var scheduleOnce sync.Once

func Attach(up *echo.Group, code int) {
	group := up.Group("/bulletin", acl.AllowRead(code))

	group.GET("/", list)

	group.Use(acl.AllowWrite(code))

	group.POST("/edit", edit)
	group.POST("/send", send)

	group.Use(acl.AllowAdmin(code))

	group.DELETE("/del", del, secretcode.Verify())
	group.POST("/revoke", revoke, secretcode.Verify())

	// 如果是主服务器则恢复定时发布
	if config.Master {
		scheduleOnce.Do(schedule)
	}
}

// 这个函数在程序启动的时候执行，可以恢复定时发布
func schedule() {
	ql := `select * from bulletins where status = 2 or status = 4`
	var bulletins []db.Bulletin

	err := db.Select(ql, &bulletins)
	if err != nil {
		xlog.X.WithError(err).Error("查询公告错")
	}
	for _, b := range bulletins {
		sendAt(&b)
	}
}
