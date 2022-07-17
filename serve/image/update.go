package image

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/pkg/errors"
)

// 更新图片
func Update(uuid string, data []byte, mimetype string) error {
	// MD5 hash as etag
	etag_bytes := md5.Sum(data)
	etag := hex.EncodeToString(etag_bytes[:])

	if len(mimetype) == 0 {
		// 通过内容检测 mime-type
		mimetype = http.DetectContentType(data)

		// 如果检查失败，则赋予 image/jepg
		if mimetype == "application/octet-stream" {
			mimetype = "image/jpeg"
		}
	}
	place := config.Config.ImagePlace()

	// 数据库
	if place == 1 {
		ql := `
			update images set place = 1, data = ?, mime = ?, etag = ?
			where uuid = ?
		`
		return db.ExecOne(ql, data, mimetype, etag, uuid)
	}
	// 文件系统
	if place == 2 {
		ql := `select path from images where uuid = ?`
		var imgname string

		err := db.SelectOne(ql, &imgname, uuid)
		if err != nil {
			return err
		}
		rootpath := config.Config.ImageRootPath()

		if len(imgname) > 0 {
			p := path.Join(rootpath, imgname)

			err = os.WriteFile(p, data, 0644)
			if err != nil {
				return errors.Wrapf(err, "写图片到文件 %s 错", p)
			}
			ql = `update images set place = 2, mime = ?, etag = ? where uuid = ?`

			return db.ExecOne(ql, mimetype, etag, uuid)
		}
		imgname = uuid

		exts, err := mime.ExtensionsByType(mimetype)
		if err != nil {
			xlog.X.WithError(err).Warnf("通过 mime-type(%s)获取扩展名错", mimetype)
		} else {
			if len(exts) > 0 {
				imgname += exts[0]
			}
		}
		p := path.Join(rootpath, imgname)

		err = os.WriteFile(p, data, 0644)
		if err != nil {
			return errors.Wrapf(err, "写图片到文件 %s 错", p)
		}
		ql = `
			update images set place = 2, path = ?, mime = ?, etag = ?
			where uuid = ?
		`
		return db.ExecOne(ql, p, mimetype, etag, uuid)
	}
	return fmt.Errorf("图片存储方式 %d 无效", place)
}
