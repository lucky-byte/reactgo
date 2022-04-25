package mail

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
	var result []db.MTA

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
	ql := `select coalesce(max(sortno), 0) from mtas`
	var sortno int

	if err := tx.Get(&sortno, tx.Rebind(ql)); err != nil {
		cc.ErrLog(err).Error("查询邮件配置错")
		tx.Rollback()
		return c.NoContent(http.StatusInternalServerError)
	}
	for i, v := range result {
		if len(v.Name) == 0 {
			tx.Rollback()

			err = fmt.Errorf("第 %d 条记录不完整: %#v", i+1, v)
			cc.ErrLog(err).Warnf("导入邮件服务配置错")
			return c.String(http.StatusBadRequest, fmt.Sprintf("第 %d 条记录不完整", i+1))
		}
		if v.CreateAt.IsZero() {
			v.CreateAt = time.Now().UTC()
		}
		if v.UpdateAt.IsZero() {
			v.UpdateAt = time.Now().UTC()
		}
		// 检查名称是否存在
		ql := `select count(*) from mtas where name = ?`
		var count int

		if err := tx.Get(&count, tx.Rebind(ql), v.Name); err != nil {
			cc.ErrLog(err).Error("查询邮件服务错")
			tx.Rollback()
			return c.NoContent(http.StatusInternalServerError)
		}
		// 如果存在则忽略
		if count > 0 {
			continue
		}
		// 添加记录
		ql = `
			insert into mtas (
				uuid, create_at, update_at, name, host, port, sslmode,
				sender, replyto, username, passwd,
				cc, bcc, prefix, nsent, disabled, sortno
			) values (
				?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
			)
		`
		_, err = tx.Exec(tx.Rebind(ql), uuid.NewString(),
			v.CreateAt, v.UpdateAt,
			v.Name, v.Host, v.Port, v.SSLMode, v.Sender, v.ReplyTo,
			v.Username, v.Passwd, v.CC, v.BCC, v.Prefix, v.NSent, v.Disabled, sortno+1,
		)
		if err != nil {
			tx.Rollback()
			cc.ErrLog(err).Error("添加邮件服务错")
			return c.NoContent(http.StatusInternalServerError)
		}
		sortno += 1
	}
	tx.Commit()

	return c.NoContent(http.StatusOK)
}
