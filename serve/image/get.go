package image

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

// Get image, response image in binary format
func get(c echo.Context) error {
	cc := c.(*ctx.Context)

	var schema, image_uuid string

	// Get query parameters from url
	err := echo.QueryParamsBinder(c).
		MustString("s", &schema).MustString("u", &image_uuid).BindError()
	if err != nil {
		cc.Log().WithError(err).Error("missing parameters")
		return c.NoContent(http.StatusBadRequest)
	}
	// Check if scheme name is correct
	s := db.Schema(schema)
	if !s.IsValid() {
		err = fmt.Errorf("schema '%s' invalid", schema)
		cc.Log().WithError(err).Error("failed to get image")
		return c.NoContent(http.StatusBadRequest)
	}
	var image db.Image

	// Query image record, if it is not found, that is mostly beacuse the
	// query parameter are incorrect, so response with Bad Request rathen than
	// InternalServiceError
	ql := s.Q("select data, mime, etag from %s.images where uuid = ?")

	if err = db.SelectOne(ql, &image, image_uuid); err != nil {
		cc.Log().WithError(err).Error("failed to get image")
		return c.NoContent(http.StatusBadRequest)
	}
	// If the image has not change since last access(by compare etag with
	// If-None-Match value), then response with 304
	etag := c.Request().Header.Get("If-None-Match")
	if len(etag) > 0 {
		if etag == image.ETag {
			return c.NoContent(http.StatusNotModified)
		}
	}
	// ETag response header is an identifier for a specific version of a resource.
	// It lets caches be more efficient and save bandwidth, as a web server does not
	// need to resend a full response if the content was not changed.
	c.Response().Header().Set("etag", image.ETag)

	return c.Blob(http.StatusOK, image.Mime, image.Data)
}
