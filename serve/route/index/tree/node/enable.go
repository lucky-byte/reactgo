package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 启用节点
func enable(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数无效")
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `select tpath from tree where uuid = ?`
	var tpath string

	if err := db.SelectOne(ql, &tpath, uuid); err != nil {
		cc.ErrLog(err).Error("查询节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `update tree set disabled = false where tpath like ?`

	if err := db.Exec(ql, tpath+"%"); err != nil {
		cc.ErrLog(err).Error("更新节点状态错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
