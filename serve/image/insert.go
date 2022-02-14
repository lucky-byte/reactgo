package image

import (
	"crypto/md5"
	"encoding/hex"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/db"
)

// 增加图片
func Insert(data []byte, mime string) (string, error) {
	// MD5 hash as etag
	etag_bytes := md5.Sum(data)
	etag := hex.EncodeToString(etag_bytes[:])

	if len(mime) == 0 {
		mime = "image/png"
	}
	ql := "insert into images (uuid, data, mime, etag) values (?, ?, ?, ?)"

	u := uuid.NewString()
	if err := db.ExecOne(ql, u, data, mime, etag); err != nil {
		return "", err
	}
	return u, nil
}
