package user

import (
	"fmt"
	"net/http"

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
		select userid, name, email, mobile, address, tfa from users
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
		"address": user.Address.String,
		"tfa":     user.TFA,
	})
}

// 修改信息
func infoUpdate(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, userid, name, email, mobile, address string
	var tfa bool

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("userid", &userid).
		MustString("name", &name).
		MustString("email", &email).
		MustString("mobile", &mobile).
		Bool("tfa", &tfa).
		String("address", &address).BindError()
	if err != nil {
		cc.ErrLog(err).Error("请求参数不完整")
		return c.NoContent(http.StatusBadRequest)
	}
	// 删除前后空白字符
	cc.Trim(&userid, &name, &email, &mobile, &address)

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
			userid = ?, name = ?, email = ?, mobile = ?, address = ?, tfa = ?,
			update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, userid, name, email, mobile, address, tfa, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
