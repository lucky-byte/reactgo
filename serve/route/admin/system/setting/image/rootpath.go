package image

import (
	"net/http"
	"os/user"
	"path"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"golang.org/x/sys/unix"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func rootpath(c echo.Context) error {
	cc := c.(*ctx.Context)

	var rootpath string

	err := echo.FormFieldBinder(c).MustString("rootpath", &rootpath).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	rootpath = tildeExpand(rootpath)

	// 必须是绝对路径
	if !path.IsAbs(rootpath) {
		return c.String(http.StatusBadRequest, "非绝对路径")
	}
	// 目录必须存在且可以写入
	err = unix.Access(rootpath, unix.W_OK)
	if err != nil {
		cc.ErrLog(err).Error("修改图片存储路径错")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	ql := `update image_store set rootpath = ?`

	if err = db.ExecOne(ql, rootpath); err != nil {
		cc.ErrLog(err).Error("更新 image_store 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 立即修改运行时配置
	cc.Config().SetImageRootPath(rootpath)

	return c.NoContent(http.StatusOK)
}

// 展开 ~(tilde) 字符，例如 ~/log 展开为 $HOME/log
func tildeExpand(p string) string {
	usr, _ := user.Current()
	dir := usr.HomeDir

	if p == "~" {
		p = dir
	} else if strings.HasPrefix(p, "~/") {
		p = filepath.Join(dir, p[2:])
	}
	return p
}
