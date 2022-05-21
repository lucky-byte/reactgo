package user

import (
	"net/http"
	"regexp"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 修改银行账号
func bank(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, name, no, mobile, idno, bank_name string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("name", &name).
		MustString("no", &no).
		MustString("mobile", &mobile).
		String("idno", &idno).
		MustString("bank_name", &bank_name).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&name, &no, &idno, &mobile, &bank_name)

	// 验证数据
	if !regexp.MustCompile(`^[0-9]+$`).MatchString(no) {
		return c.String(http.StatusBadRequest, "账号格式错误")
	}
	if !regexp.MustCompile(`^[0-9]{17}[0-9xX]$`).MatchString(idno) {
		return c.String(http.StatusBadRequest, "身份证号格式错误")
	}
	if !regexp.MustCompile(`^1[0-9]{10}$`).MatchString(mobile) {
		return c.String(http.StatusBadRequest, "手机号格式错误")
	}
	// 检查是否可修改
	if _, err = isUpdatable(uuid); err != nil {
		cc.ErrLog(err).Error("修改用户银行账号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 更新信息
	ql := `
		update users set
			acct_name = ?, acct_no = ?, acct_idno = ?, acct_mobile = ?,
			acct_bank_name = ?,
			update_at = current_timestamp
		where uuid = ? and disabled = false and deleted = false
	`
	err = db.ExecOne(ql, name, no, idno, mobile, bank_name, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户银行账号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
