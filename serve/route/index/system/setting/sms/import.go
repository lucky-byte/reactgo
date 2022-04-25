package sms

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 导入
func importt(c echo.Context) error {
	cc := c.(*ctx.Context)

	file, err := c.FormFile("file")
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	f, err := file.Open()
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	defer f.Close()

	b, err := io.ReadAll(f)
	if err != nil {
		cc.ErrLog(err).Error("读上传文件错")
		return c.NoContent(http.StatusBadRequest)
	}
	var result []db.SMS

	if err = json.Unmarshal(b, &result); err != nil {
		cc.ErrLog(err).Error("解析上传文件错")
		return c.String(http.StatusBadRequest, "解析文件错")
	}
	tx, err := db.Default().Beginx()
	if err != nil {
		cc.ErrLog(err).Error("启动数据库事务错")
		return c.NoContent(http.StatusInternalServerError)
	}
	// 查询最大 sortno
	ql := `select coalesce(max(sortno), 0) from smss`
	var sortno int

	if err := tx.Get(&sortno, tx.Rebind(ql)); err != nil {
		cc.ErrLog(err).Error("查询短信服务错")
		tx.Rollback()
		return c.NoContent(http.StatusInternalServerError)
	}
	for i, v := range result {
		if len(v.ISP) == 0 || len(v.ISPName) == 0 {
			tx.Rollback()

			err = fmt.Errorf("第 %d 条记录不完整: %#v", i+1, v)
			cc.ErrLog(err).Warnf("导入短信服务配置错")
			return c.String(http.StatusBadRequest, fmt.Sprintf("第 %d 条记录不完整", i+1))
		}
		if v.CreateAt.IsZero() {
			v.CreateAt = time.Now().UTC()
		}
		if v.UpdateAt.IsZero() {
			v.UpdateAt = time.Now().UTC()
		}
		// 检查 appid 是否存在
		ql := `select count(*) from smss where appid = ?`
		var count int

		if err := tx.Get(&count, tx.Rebind(ql), v.AppId); err != nil {
			cc.ErrLog(err).Error("查询短信服务错")
			tx.Rollback()
			return c.NoContent(http.StatusInternalServerError)
		}
		// 如果存在则忽略
		if count > 0 {
			continue
		}
		// 添加记录
		ql = `
			insert into smss (
				uuid, create_at, update_at, isp, isp_name, appid, secret_id,
				secret_key, prefix, textno1, nsent, disabled, sortno
			) values (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`
		_, err = tx.Exec(tx.Rebind(ql), uuid.NewString(),
			v.CreateAt, v.UpdateAt, v.ISP, v.ISPName, v.AppId, v.SecretId,
			v.SecretKey, v.Prefix, v.TextNo1, v.NSent, v.Disabled, sortno+1,
		)
		if err != nil {
			tx.Rollback()
			cc.ErrLog(err).Error("导入短信服务错")
			return c.NoContent(http.StatusInternalServerError)
		}
		sortno += 1
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
