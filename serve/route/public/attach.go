package public

import (
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/route/public/bulletin"
)

// 公开访问
func Attach(up *echo.Echo, conf *config.ViperConfig) {
	group := up.Group("/pubacc")

	bulletin.Attach(group) // 公告
}
