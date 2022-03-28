package mailfs

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/mail"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/ticket"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

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
	r := false
	t := time.Now().Unix()

	ticket.Range(func(k string, e *ticket.TicketEntry) bool {
		if e.UserData == email {
			if t-e.CreateAt < 60 { // 1分钟内不能重复发送验证码到同一个邮箱地址
				r = true
			}
			return true
		}
		return false
	})
	return r
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
	err = ticket.Set(id, &ticket.TicketEntry{
		CreateAt: time.Now().Unix(),
		ExpiryAt: time.Now().Add(30 * time.Minute).Unix(),
		Code:     code,
		Failed:   0,
		UserData: email,
	})
	if err != nil {
		return "", err
	}
	return id, nil
}

// 验证验证码
func VerifyCode(id string, code string, email string) error {
	// 获取缓存记录
	entry, err := ticket.Get(id)
	if err != nil {
		return errors.Wrap(err, "查询验证码缓存错")
	}
	// 检查是否在有效期内
	if time.Now().Unix() > entry.ExpiryAt {
		return fmt.Errorf("验证超时，请重新获取验证码")
	}
	// 超出最多验证失败次数
	if entry.Failed > 5 {
		return fmt.Errorf("验证失败次数超限，请重新获取验证码")
	}
	// 验证是否匹配，如果不匹配增加失败次数
	if code != entry.Code || email != entry.UserData {
		entry.Failed += 1
		ticket.Set(id, entry)
		return fmt.Errorf("验证失败，验证码不匹配")
	}
	// 验证通过，删除记录
	return ticket.Del(id)
}
