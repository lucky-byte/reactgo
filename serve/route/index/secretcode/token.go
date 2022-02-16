package secretcode

import (
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/lucky-byte/reactgo/serve/secure"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

var tokenCache sync.Map

type cacheEntry struct {
	timestamp int64  // 生成时间
	token     string // token
	failed    int    // 验证失败次数
}

// 30分钟内有效
const expiryTime = 60 * 30

// 生成 token 并缓存
func genToken(user_uuid string) string {
	var token string

	if r, err := secure.RandomBytes(16); err != nil {
		xlog.X.WithError(err).Error("生成安全随机数错")
		token = uuid.NewString()
	} else {
		token = hex.EncodeToString(r)
	}
	tokenCache.Store(user_uuid, &cacheEntry{
		timestamp: time.Now().Unix(),
		token:     token,
		failed:    0,
	})
	return token
}

// 验证 token 是否正确
func verifyToken(user_uuid string, token string) error {
	defer clean()

	v, ok := tokenCache.Load(user_uuid)
	if !ok {
		return fmt.Errorf("记录不存在")
	}
	entry, ok := v.(*cacheEntry)
	if !ok {
		return fmt.Errorf("验证码缓存内容无效")
	}
	// 检查是否在有效期内
	if time.Now().Unix()-entry.timestamp > expiryTime {
		return fmt.Errorf("验证超时，请重新验证")
	}
	// 超出最多验证失败次数
	if entry.failed > 5 {
		return fmt.Errorf("验证失败次数超限，请重新验证")
	}
	// 验证是否匹配，如果不匹配增加失败次数
	if token != entry.token {
		entry.failed += 1
		tokenCache.Store(user_uuid, entry)
		return fmt.Errorf("验证失败，TOKEN 不匹配")
	}
	// 验证成功，删除记录
	tokenCache.Delete(user_uuid)

	return nil
}

// 清理所有过期的记录
func clean() {
	tokenCache.Range(func(key, value interface{}) bool {
		if entry, ok := value.(*cacheEntry); ok {
			if time.Now().Unix()-entry.timestamp > expiryTime {
				tokenCache.Delete(key)
			}
		}
		return true
	})
}
