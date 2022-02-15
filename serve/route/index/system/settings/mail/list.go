package mail

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询邮件 MTA 列表
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	ql := `select * from mtas order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, v := range result {
		list = append(list, echo.Map{
			"uuid":   v.UUID,
			"name":   v.Name,
			"host":   v.Host,
			"port":   v.Port,
			"ssl":    v.SSL,
			"sender": v.Sender,
			"sortno": v.SortNo,
			"nsent":  v.NSent,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
