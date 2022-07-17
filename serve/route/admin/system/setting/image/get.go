package image

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func get(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from image_store limit 1`
	var store db.ImageStore

	if err := db.SelectOne(ql, &store); err != nil {
		cc.ErrLog(err).Error("查询 image_store 信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, store)
}
