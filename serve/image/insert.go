package image

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/pkg/errors"
)

// 增加图片
func Insert(data []byte, mimetype string) (string, error) {
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
	imgid := uuid.NewString()

	place := config.Config.ImagePlace()

	// 保存到数据库
	if place == 1 {
		ql := `
			insert into images (uuid, place, data, mime, etag)
			values (?, 1, ?, ?, ?)
		`
		err := db.ExecOne(ql, imgid, data, mimetype, etag)
		if err != nil {
			return "", err
		}
		return imgid, nil
	}
	// 保存到文件系统
	if place == 2 {
		imgname := imgid

		exts, err := mime.ExtensionsByType(mimetype)
		if err != nil {
			xlog.X.WithError(err).Warnf("通过 mime-type(%s)获取扩展名错", mimetype)
		} else {
			if len(exts) > 0 {
				imgname += exts[0]
			}
		}
		rootpath := config.Config.ImageRootPath()
		p := path.Join(rootpath, imgname)

		err = os.WriteFile(p, data, 0644)
		if err != nil {
			return "", errors.Wrapf(err, "写图片到文件 %s 错", p)
		}
		ql := `
			insert into images (uuid, place, data, path, mime, etag)
			values (?, 2, ?, ?, ?, ?)
		`
		err = db.ExecOne(ql, imgid, "", imgname, mimetype, etag)
		if err != nil {
			return "", err
		}
		return imgid, nil
	}
	return "", fmt.Errorf("图片存储方式 %d 无效", place)
}
