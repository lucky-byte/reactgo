package image

import (
	"net/http"
	"os"
	"path"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 获取图片，以二进制形式响应图片数据
func get(c echo.Context) error {
	cc := c.(*ctx.Context)

	var image_uuid string

	err := echo.QueryParamsBinder(c).MustString("u", &image_uuid).BindError()
	if err != nil {
		cc.Log().WithError(err).Error("missing parameters")
		return c.NoContent(http.StatusBadRequest)
	}
	// 查询图片
	ql := "select * from images where uuid = ?"
	var image db.Image

	err = db.SelectOne(ql, &image, image_uuid)
	if err != nil {
		cc.Log().WithError(err).Error("failed to get image")
		return c.NoContent(http.StatusBadRequest)
	}
	// 如果图片自从上次访问后没有改变(比较 etag 和 If-None-Match 的值)，则返回 304
	etag := c.Request().Header.Get("If-None-Match")
	if len(etag) > 0 {
		if etag == image.ETag {
			return c.NoContent(http.StatusNotModified)
		}
	}
	// ETag 响应首部是资源特定版本的标识符， 如果内容没有改变，服务器只需要响应内容未变，
	// 不需要响应这个资源内容，这样可以让客户端缓存更有效，节省带宽
	c.Response().Header().Set("etag", image.ETag)

	// 数据库
	if image.Place == 1 {
		return c.Blob(http.StatusOK, image.Mime, image.Data)
	}
	// 文件系统
	if image.Place == 2 {
		rootpath := config.Config.ImageRootPath()
		p := path.Join(rootpath, image.Path)

		data, err := os.ReadFile(p)
		if err != nil {
			cc.ErrLog(err).Errorf("从文件 %s 读取图片错", p)
		}
		return c.Blob(http.StatusOK, image.Mime, data)
	}
	return c.NoContent(http.StatusBadRequest)
}
