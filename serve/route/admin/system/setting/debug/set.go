package debug

import (
	"net/http"
	"syscall"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func set(c echo.Context) error {
	cc := c.(*ctx.Context)

	var enable bool

	err := echo.FormFieldBinder(c).MustBool("enable", &enable).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update debug set debug = ?`

	if err = db.ExecOne(ql, enable); err != nil {
		cc.ErrLog(err).Error("更新 debug 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 发送 SIGHUP 信号重启服务
	err = syscall.Kill(syscall.Getpid(), syscall.SIGHUP)
	if err != nil {
		cc.ErrLog(err).Error("发送 SIGHUP 信号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
