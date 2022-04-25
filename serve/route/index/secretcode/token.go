package secretcode

import (
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/secure"
	"github.com/lucky-byte/reactgo/serve/ticket"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/pkg/errors"
)

// 生成 token 并缓存
func genToken(user_uuid string) string {
	var token string

	if r, err := secure.RandomBytes(16); err != nil {
		xlog.X.WithError(err).Error("生成安全随机数错")
		token = uuid.NewString()
	} else {
		token = hex.EncodeToString(r)
	}
	err := ticket.Set(user_uuid, &ticket.TicketEntry{
		CreateAt: time.Now().Unix(),
		ExpiryAt: time.Now().Add(10 * time.Minute).Unix(),
		Code:     token,
		Failed:   0,
	})
	if err != nil {
		xlog.X.WithError(err).Errorf("保存安全码 token 错")
	}
	return token
}

// 验证 token 是否正确
func verifyToken(user_uuid string, token string) error {
	entry, err := ticket.Get(user_uuid)
	if err != nil {
		return errors.Wrap(err, "查询验证码缓存错")
	}
	// 检查是否在有效期内
	if time.Now().Unix() > entry.ExpiryAt {
		return fmt.Errorf("验证超时，请重新验证")
	}
	// 超出最多验证失败次数
	if entry.Failed > 5 {
		return fmt.Errorf("验证失败次数超限，请重新验证")
	}
	// 验证是否匹配，如果不匹配增加失败次数
	if token != entry.Code {
		entry.Failed += 1
		ticket.Set(user_uuid, entry)
		return fmt.Errorf("验证失败，TOKEN 不匹配")
	}
	return nil
}
