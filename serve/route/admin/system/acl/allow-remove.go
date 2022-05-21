package acl

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func allowRemove(c echo.Context) error {
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
	uuids := []string{}

	for _, v := range allows {
		uuids = append(uuids, v.UUID)
	}
	ql := `delete from acl_allows where acl = ? and uuid in (?)`

	ql, args, err := db.In(ql, acl, uuids)
	if err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if err = db.Exec(ql, args...); err != nil {
		cc.ErrLog(err).Error("更新访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
