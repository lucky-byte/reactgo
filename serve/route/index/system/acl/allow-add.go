package acl

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func allowAdd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var acl, entries string

	err := echo.FormFieldBinder(c).
		MustString("acl", &acl).
		MustString("entries", &entries).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	var allows []db.ACLAllow

	if err = json.Unmarshal([]byte(entries), &allows); err != nil {
		cc.ErrLog(err).Error("解析 entries 错")
		return c.NoContent(http.StatusBadRequest)
	}
	codes := []int{}

	for _, v := range allows {
		codes = append(codes, v.Code)
	}
	ql := `select count(*) from acl_allows where acl = ? and code in (?)`

	ql, args, err := db.In(ql, acl, codes)
	if err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var count int

	if err = db.SelectOne(ql, &count, args...); err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, "代码重复")
	}
	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("开启数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	for _, v := range allows {
		ql = `
			insert into acl_allows (uuid, acl, code, title, url)
			values (?, ?, ?, ?, ?)
		`
		_, err = tx.Exec(
			tx.Rebind(ql), uuid.NewString(), acl, v.Code, v.Title, v.URL,
		)
		if err != nil {
			cc.ErrLog(err).Error("更新访问控制信息错")
			tx.Rollback()
			return c.NoContent(http.StatusInternalServerError)
		}
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
