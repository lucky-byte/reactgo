package user

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/mssola/user_agent"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

func profile(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid string

	err := echo.QueryParamsBinder(c).MustString("uuid", &uuid).BindError()
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	// 查询用户信息
	ql := `
		select create_at, update_at, signin_at,
			userid, name, email, mobile, address, n_signin,
			tfa, acl, disabled, deleted
		from users where uuid = ?
	`
	var user db.User

	if err = db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询访问控制信息
	acl, err := profileAcl(user.ACL)
	if err != nil {
		cc.ErrLog(err).Error("查询访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询登录历史
	history, err := profileHistory(uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询用户登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"create_at": user.CreateAt,
		"update_at": user.UpdateAt,
		"signin_at": user.SigninAt,
		"userid":    user.UserId,
		"name":      user.Name,
		"mobile":    user.Mobile,
		"email":     user.Email,
		"address":   user.Address.String,
		"n_signin":  user.NSignin,
		"tfa":       user.TFA,
		"disabled":  user.Disabled,
		"deleted":   user.Deleted,
		"acl":       acl,
		"history":   history,
	})
}

// 查询访问控制信息
func profileAcl(acluuid string) (*echo.Map, error) {
	ql := `select name, summary from acl where uuid = ?`
	var result db.ACL

	if err := db.SelectOne(ql, &result, acluuid); err != nil {
		return nil, err
	}
	acl := echo.Map{
		"name":    result.Name,
		"summary": result.Summary,
	}
	return &acl, nil
}

// 查询登录历史
func profileHistory(user_uuid string) ([]echo.Map, error) {
	ql := `
		select create_at, userid, name, ip, city, ua from signin_history
		where user_uuid = ? order by create_at desc
	`
	var result []db.SigninHistory

	if err := db.Select(ql, &result, user_uuid); err != nil {
		return nil, err
	}
	var history []echo.Map

	for _, h := range result {
		ua := user_agent.New(h.UA) // parse useragent string

		osinfo := ua.OSInfo()
		os := fmt.Sprintf("%s %s", osinfo.Name, osinfo.Version)

		name, version := ua.Browser()
		browser := fmt.Sprintf("%s %s", name, version)

		history = append(history, echo.Map{
			"create_at": h.CreateAt,
			"userid":    h.UserId,
			"name":      h.Name,
			"ip":        h.IP,
			"city":      h.City.String,
			"os":        os,
			"browser":   browser,
			"is_mobile": ua.Mobile(),
		})
	}
	return history, nil
}
