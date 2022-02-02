package mailfs

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/mail"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 已发送的验证码，内存缓存，重启后失效
var codeCache sync.Map

type cacheEntry struct {
	timestamp int64  // 发送时间
	code      string // 验证码
	email     string // 邮箱地址
	failed    int    // 验证失败次数
}

// 生成 6 位随机数字验证码
func randomCode() string {
	table := [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}

	b := make([]byte, 6)

	n, err := io.ReadAtLeast(rand.Reader, b, 6)
	if n != 6 {
		xlog.X.WithError(err).Error("生成短信验证码错")
		return "090807"
	}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

// 检查 1 分钟内是否有发送短信到邮箱，如果有则返回失败，避免发送太频繁
func isTooFrequency(email string) bool {
	ret := false

	t := time.Now().Unix()

	codeCache.Range(func(key, value interface{}) bool {
		entry, ok := value.(*cacheEntry)
		if !ok {
			xlog.X.Error("验证码缓存内容无效")
			return false
		}
		if entry.email == email {
			if t-entry.timestamp < 60 { // 1分钟内不能重复发送验证码到同一个邮箱地址
				ret = true
				return false
			}
		}
		return true
	})
	return ret
}

// 发送验证码
func SendCode(email string, name string) (string, error) {
	if isTooFrequency(email) {
		return "", fmt.Errorf("发送太频繁，请等待一分钟后再重试")
	}
	code := randomCode()
	id := uuid.NewString()

	// 生成邮件
	m, err := Message("验证码: "+code, "code", map[string]interface{}{
		"name": name,
		"code": code,
	})
	if err != nil {
		return "", err
	}
	addr, err := mail.ParseAddress(email)
	if err != nil {
		return "", err
	}
	m.AddTO(addr)

	// 发送邮件
	if err = m.Send(); err != nil {
		return "", err
	}
	// 保存验证码后续验证
	codeCache.Store(id, &cacheEntry{
		timestamp: time.Now().Unix(),
		code:      code,
		email:     email,
		failed:    0,
	})
	return id, nil
}

// 验证验证码
func VerifyCode(id string, code string, email string) error {
	defer clean() // 清理过期记录

	// 获取缓存记录
	v, ok := codeCache.Load(id)
	if !ok {
		return fmt.Errorf("记录不存在")
	}
	entry, ok := v.(*cacheEntry)
	if !ok {
		xlog.X.Error("验证码缓存内容无效")
		return fmt.Errorf("系统内部错")
	}
	// 30 分钟内有效
	if time.Now().Unix()-entry.timestamp > 60*30 {
		return fmt.Errorf("验证超时，请重新获取验证码")
	}
	// 超出最多验证失败次数
	if entry.failed > 5 {
		return fmt.Errorf("验证失败次数超限，请重新获取验证码")
	}
	// 验证是否匹配，如果不匹配增加失败次数
	if code != entry.code || email != entry.email {
		entry.failed += 1
		codeCache.Store(id, entry)
		return fmt.Errorf("验证失败，验证码不匹配")
	}
	return nil
}

// 清理所有过期的记录
func clean() {
	codeCache.Range(func(key, value interface{}) bool {
		if entry, ok := value.(*cacheEntry); ok {
			if time.Now().Unix()-entry.timestamp > 60*30 {
				codeCache.Delete(key)
			}
		}
		return true
	})
}
