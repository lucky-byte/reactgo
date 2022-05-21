package sms

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 添加腾讯云短信服务
func tencentAdd(c echo.Context) error {
	cc := c.(*ctx.Context)

	var appid, secret_id, textno1, secret_key, prefix string

	err := echo.FormFieldBinder(c).
		MustString("appid", &appid).
		MustString("secret_id", &secret_id).
		MustString("secret_key", &secret_key).
		MustString("prefix", &prefix).
		MustString("textno1", &textno1).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&appid, &secret_id, &secret_key, &prefix, &textno1)

	// Appid 不能重复
	ql := `select count(*) from smss where appid = ?`
	count := 0

	if err = db.SelectOne(ql, &count, appid); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("Appid %s 已存在", appid))
	}
	ql = `select coalesce(max(sortno), 0) from smss`
	sortno := 0

	if err = db.SelectOne(ql, &sortno); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	ql = `
		insert into smss (
			uuid, isp, isp_name, appid, secret_id, secret_key, prefix, textno1, sortno
		) values (
			?, ?, ?, ?, ?, ?, ?, ?, ?
		)
	`
	err = db.ExecOne(ql, uuid.NewString(),
		"tencent", "腾讯云", appid, secret_id, secret_key, prefix, textno1, sortno+1,
	)
	if err != nil {
		cc.ErrLog(err).Error("添加短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}

// 修改腾讯云短信服务
func tencentModify(c echo.Context) error {
	cc := c.(*ctx.Context)

	var uuid, appid, secret_id, textno1, secret_key, prefix string

	err := echo.FormFieldBinder(c).
		MustString("uuid", &uuid).
		MustString("appid", &appid).
		MustString("secret_id", &secret_id).
		MustString("secret_key", &secret_key).
		MustString("prefix", &prefix).
		MustString("textno1", &textno1).BindError()
	if err != nil {
		return cc.BadRequest(err)
	}
	cc.Trim(&appid, &secret_id, &secret_key, &prefix, &textno1)

	// Appid 不能重复
	ql := `select count(*) from smss where appid = ? and uuid <> ?`
	count := 0

	if err = db.SelectOne(ql, &count, appid, uuid); err != nil {
		cc.ErrLog(err).Error("查询短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	if count > 0 {
		return c.String(http.StatusConflict, fmt.Sprintf("Appid %s 已存在", appid))
	}
	ql = `
		update smss set
			appid = ?, secret_id = ?, secret_key = ?, prefix = ?, textno1 = ?,
			update_at = current_timestamp
		where uuid = ?
	`
	err = db.ExecOne(ql, appid, secret_id, secret_key, prefix, textno1, uuid)
	if err != nil {
		cc.ErrLog(err).Error("更新短信配置错")
		return c.NoContent(http.StatusInternalServerError)
	}
	return c.NoContent(http.StatusOK)
}
