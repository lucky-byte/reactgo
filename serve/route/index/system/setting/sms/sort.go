package sms

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 排序
func sort(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mta_uuid, dir string
	var sortno int

	err := echo.FormFieldBinder(c).
		MustString("uuid", &mta_uuid).
		MustString("dir", &dir).
		MustInt("sortno", &sortno).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 移到最前
	if dir == "top" {
		ql := `
			update smss set sortno = (select min(sortno) from smss) - 1
			where uuid = ?
		`
		if err = db.ExecOne(ql, mta_uuid); err != nil {
			cc.ErrLog(err).Error("排序错误")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}
	// 移到最后
	if dir == "bottom" {
		ql := `
			update smss set sortno = (select max(sortno) from smss) + 1
			where uuid = ?
		`
		if err = db.ExecOne(ql, mta_uuid); err != nil {
			cc.ErrLog(err).Error("排序错误")
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}
	return c.String(http.StatusBadRequest, "操作无效")
}
