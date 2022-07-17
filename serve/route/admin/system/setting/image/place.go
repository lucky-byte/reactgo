package image

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func place(c echo.Context) error {
	cc := c.(*ctx.Context)

	var place int

	err := echo.FormFieldBinder(c).MustInt("place", &place).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `update image_store set place = ?`

	if err = db.ExecOne(ql, place); err != nil {
		cc.ErrLog(err).Error("更新 image_store 配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 立即修改运行时配置
	cc.Config().SetImagePlace(place)

	return c.NoContent(http.StatusOK)
}
