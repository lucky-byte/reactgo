package bank

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
)

// 查询渠道开发商
func list(c echo.Context) error {
	cc := c.(*ctx.Context)

	var page, rows_per_page uint
	var keyword string

	err := echo.FormFieldBinder(c).
		MustUint("page", &page).
		MustUint("rows_per_page", &rows_per_page).
		String("keyword", &keyword).BindError()
	if err != nil {
		cc.ErrLog(err).Error("无效的请求")
		return c.NoContent(http.StatusBadRequest)
	}
	offset := page * rows_per_page
	keyword = fmt.Sprintf("%%%s%%", strings.TrimSpace(keyword))

	// 查询总数
	ql := `
		select count(*) from bank_develops
		where name ilike $1 or mobile ilike $1 or email ilike $1 or
			address ilike $1 or company ilike $1
	`
	var total int

	if err = db.SelectOne(ql, &total, keyword); err != nil {
		cc.ErrLog(err).Error("查询渠道开发商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询列表
	ql = `
		select * from bank_develops
		where name ilike $1 or mobile ilike $1 or email ilike $1 or
			address ilike $1 or company ilike $1
		order by create_at desc
		offset $2 limit $3
	`
	var rt []db.BankDevelop

	err = db.Select(ql, &rt, keyword, offset, rows_per_page)
	if err != nil {
		cc.ErrLog(err).Error("查询渠道开发商信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var develops []echo.Map

	for _, r := range rt {
		develops = append(develops, echo.Map{
			"uuid":      r.UUID,
			"create_at": r.CreateAt,
			"disabled":  r.Disabled,
			"deleted":   r.Deleted,
			"name":      r.Name,
			"mobile":    r.Mobile,
			"email":     r.Email,
			"address":   r.Address.String,
			"company":   r.Company.String,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"total": total, "develops": develops})
}
