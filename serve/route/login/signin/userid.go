package signin

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/sms"
)

// 发送短信验证码
func useridCode(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mobile string

	err := echo.FormFieldBinder(c).MustString("mobile", &mobile).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	// 查询手机号是否存在
	ql := `
		select count(*) from users
		where mobile = ? and disabled = false and deleted = false
	`
	var count int

	if err = db.SelectOne(ql, &count, mobile); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count == 0 {
		return c.String(http.StatusNotFound, "手机号不存在")
	}
	// 发送验证码
	smsid, err := sms.SendCode(mobile)
	if err != nil {
		cc.ErrLog(err).Error("发送短信验证码错误")
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, echo.Map{"smsid": smsid})
}

// 查询登录名
func useridSearch(c echo.Context) error {
	cc := c.(*ctx.Context)

	var mobile, smsid, code string

	err := echo.FormFieldBinder(c).
		MustString("mobile", &mobile).
		MustString("smsid", &smsid).
		MustString("code", &code).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}

	// 验证短信验证码
	err = sms.VerifyCode(smsid, code, mobile)
	if err != nil {
		cc.ErrLog(err).WithField("mobile", mobile).Error("找回登录名验证短信验证码失败")
		return c.String(http.StatusBadRequest, err.Error())
	}
	// 查询所有绑定的登录名
	ql := `
		select userid, avatar from users
		where mobile = ? and disabled = false and deleted = false
	`
	var result []db.User

	if err = db.Select(ql, &result, mobile); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	var list []echo.Map

	for _, v := range result {
		list = append(list, echo.Map{
			"userid": v.UserId,
			"avatar": v.Avatar,
		})
	}
	return c.JSON(http.StatusOK, echo.Map{"list": list})
}
