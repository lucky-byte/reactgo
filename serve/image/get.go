package image

import (
	"net/http"

	"github.com/labstack/echo/v4"

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
	var image db.Image

	// 查询图片
	ql := "select data, mime, etag from images where uuid = ?"

	if err = db.SelectOne(ql, &image, image_uuid); err != nil {
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

	return c.Blob(http.StatusOK, image.Mime, image.Data)
}
