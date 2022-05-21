package user

import (
	"fmt"
	"net/http"
	"strings"

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
	ql := `select * from users where uuid = ?`
	var user db.User

	if err = db.SelectOne(ql, &user, uuid); err != nil {
		cc.ErrLog(err).Error("查询用户信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询访问控制信息
	acl, err := profileAcl(user.ACL)
	if err != nil {
		cc.ErrLog(err).Error("查询用户访问控制信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询绑定节点
	node, err := profileNode(uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询用户绑定节点信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询授权账号
	oauth, err := profileOAuth(uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询用户授权账号错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询登录历史
	history, err := profileHistory(uuid)
	if err != nil {
		cc.ErrLog(err).Error("查询用户登录历史信息错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.JSON(http.StatusOK, echo.Map{
		"uuid":             user.UUID,
		"create_at":        user.CreateAt,
		"update_at":        user.UpdateAt,
		"signin_at":        user.SigninAt,
		"userid":           user.UserId,
		"avatar":           user.Avatar,
		"name":             user.Name,
		"mobile":           user.Mobile,
		"email":            user.Email,
		"idno":             user.IdNo,
		"address":          user.Address,
		"acct_name":        user.AcctName,
		"acct_no":          user.AcctNo,
		"acct_idno":        user.AcctIdno,
		"acct_mobile":      user.AcctMobile,
		"acct_bank_name":   user.AcctBankName,
		"n_signin":         user.NSignin,
		"tfa":              user.TFA,
		"secretcode_isset": len(user.SecretCode) > 0,
		"totp_isset":       len(user.TOTPSecret) > 0,
		"disabled":         user.Disabled,
		"deleted":          user.Deleted,
		"acl":              acl,
		"node":             node,
		"oauth":            oauth,
		"history":          history,
	})
}

// 查询访问控制信息
func profileAcl(acl_uuid string) (*echo.Map, error) {
	ql := `select name, summary from acl where uuid = ?`
	var result db.ACL

	if err := db.SelectOne(ql, &result, acl_uuid); err != nil {
		return nil, err
	}
	acl := echo.Map{"name": result.Name, "summary": result.Summary}
	return &acl, nil
}

// 查询访问节点
func profileNode(user_uuid string) (*echo.Map, error) {
	ql := `
		select * from tree where uuid = (
			select node from tree_bind where entity = ? and type = 1
		)
	`
	var nodes []db.Tree

	if err := db.Select(ql, &nodes, user_uuid); err != nil {
		return nil, err
	}
	if len(nodes) == 0 {
		return nil, nil
	}
	if len(nodes) > 1 {
		return nil, fmt.Errorf("用户绑定了多个节点")
	}
	result := echo.Map{"name": nodes[0].Name, "nlevel": nodes[0].NLevel}
	return &result, nil
}

// 查询授权账号
func profileOAuth(user_uuid string) (string, error) {
	ql := `select provider from user_oauth where user_uuid = ? and status = 2`
	var result []string

	if err := db.Select(ql, &result, user_uuid); err != nil {
		return "", err
	}
	return strings.Join(result, ", "), nil
}

// 查询登录历史
func profileHistory(user_uuid string) ([]echo.Map, error) {
	ql := `
		select * from signin_history
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
			"country":   h.Country,
			"province":  h.Province,
			"city":      h.City,
			"district":  h.District,
			"longitude": h.Longitude,
			"latitude":  h.Latitude,
			"os":        os,
			"browser":   browser,
			"is_mobile": ua.Mobile(),
		})
	}
	return history, nil
}
