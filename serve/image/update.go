package image

import (
	"crypto/md5"
	"encoding/hex"

	"github.com/lucky-byte/reactgo/serve/db"
)

// 更新图片
func Update(uuid string, data []byte, mime string) error {
	// MD5 hash as etag
	etag_bytes := md5.Sum(data)
	etag := hex.EncodeToString(etag_bytes[:])

	if len(mime) == 0 {
		mime = "image/png"
	}
	ql := "update images set data = ?, mime = ?, etag = ? where uuid = ?"

	return db.ExecOne(ql, data, mime, etag, uuid)
}
