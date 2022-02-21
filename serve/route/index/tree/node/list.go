package node

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select name, disabled from tree order by nlevel, sortno`
	var records []db.Tree

	if err := db.Select(ql, &records); err != nil {
		cc.ErrLog(err).Error("查询层次结构错")
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusOK)
}
