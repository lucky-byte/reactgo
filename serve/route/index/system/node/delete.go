package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 删除节点
func del(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.FormFieldBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	ql := `select tpath, nlevel from tree where uuid = ?`
	var node db.Tree

	if err := db.SelectOne(ql, &node, uuid); err != nil {
		cc.ErrLog(err).Error("查询节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 不能删除根节点
	if node.NLevel == 1 || node.TPath == "0" {
		return c.String(http.StatusBadRequest, "不能删除根节点")
	}
	ql = `delete from tree where tpath like ?`

	if err := db.Exec(ql, node.TPath+"%"); err != nil {
		cc.ErrLog(err).Error("删除节点错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
