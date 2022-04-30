package user

import (
	"fmt"
	"net/http"
	"net/mail"
	"regexp"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询信息
func infoGet(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	ql := `
		select userid, name, email, mobile, idno, address, tfa from users
		where uuid = ?
	`
	var user db.User

	if err := db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"userid":  user.UserId,
		"name":    user.Name,
		"mobile":  user.Mobile,
		"email":   user.Email,
		"idno":    user.IdNo,
		"address": user.Address,
		"tfa":     user.TFA,
	})
}

// 修改信息
func infoUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, userid, name, email, mobile, idno, address string
	var tfa bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("userid", &userid).
		MustString("name", &name).
		MustString("email", &email).
		MustString("mobile", &mobile).
		String("idno", &idno).
		Bool("tfa", &tfa).
		String("address", &address).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 删除前后空白字符
	cc.Trim(&userid, &name, &email, &mobile, &address)

	// 验证数据
	if !regexp.MustCompile(`^1[0-9]{10}$`).MatchString(mobile) {
		return c.String(http.StatusBadRequest, "手机号格式错误")
	}
	if _, err = mail.ParseAddress(email); err != nil {
		cc.ErrLog(err).Error("解析邮箱地址错")
		return c.String(http.StatusBadRequest, "邮箱地址格式错误")
	}
	if len(idno) > 0 {
		if !regexp.MustCompile(`^[0-9]{17}[0-9xX]$`).MatchString(idno) {
			return c.String(http.StatusBadRequest, "身份证号格式错误")
		}
	}
	// 检查是否可修改
	if _, err = isUpdatable(uuid); err != nil {
		cc.ErrLog(err).Error("修改用户资料错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询 userid 是否冲突
	ql := `select count(*) from users where userid = ? and uuid <> ?`
	var count int

	if err := db.SelectOne(ql, &count, userid, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("%s 已存在", userid))
	}
	// 更新信息
	ql = `
		update users set
			userid = ?, name = ?, email = ?, mobile = ?, idno = ?, address = ?,
			tfa = ?, update_at = current_timestamp
		where uuid = ? and disabled = false and deleted = false
	`
	err = db.ExecOne(ql, userid, name, email, mobile, idno, address, tfa, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
