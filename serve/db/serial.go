package db

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 生成新的序号
func Serial() (uint64, error) {
	ql := `update serials set n = n + 1 returning n`
	var n uint64

	err := SelectOne(ql, &n)
	if err != nil {
		return 0, err
	}
	return n, nil

}

func TimeSerial() string {
	n, err := Serial()
	if err != nil {
		xlog.X.WithError(err).Error("生成数据库序号错")
		n = rand.Uint64()
	}
	n = n % 10000

	t := time.Now()
	return fmt.Sprintf("%s%d", t.Format("20060102150405000"), n)
}
