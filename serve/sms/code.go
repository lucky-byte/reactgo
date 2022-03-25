package sms

import (
	"crypto/rand"
	"fmt"
	"io"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/ticket"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

var ticketType = "smscode"

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

// 检查 1 分钟内是否有发送短信到手机号，如果有则返回失败，避免发送太频繁
func isTooFrequency(mobile string) bool {
	t := time.Now().Unix()

	for _, entry := range ticket.Find(ticketType) {
		if entry.UserData == mobile {
			if t-entry.CreateAt < 60 { // 1分钟内不能重复发送验证码到同一个手机号
				return true
			}
		}
	}
	return false
}

// 发送短信验证码
func SendCode(mobile string) (string, error) {
	if isTooFrequency(mobile) {
		return "", fmt.Errorf("发送太频繁，请等待一分钟后再重试")
	}
	code := randomCode()
	smsid := uuid.NewString()

	id, err := VerifyCodeId()
	if err != nil {
		return "", err
	}
	err = Send([]string{mobile}, id, []string{code})
	if err != nil {
		return "", err
	}
	// 保存验证码后续验证
	err = ticket.Add(smsid, ticketType, &ticket.TicketEntry{
		CreateAt: time.Now().Unix(),
		ExpiryAt: time.Now().Add(10 * time.Minute).Unix(),
		Code:     code,
		Failed:   0,
		UserData: mobile,
	})
	if err != nil {
		return "", err
	}
	return smsid, nil
}

// 验证短信验证码
func VerifyCode(smsid string, code string, mobile string) error {
	entry, err := ticket.Get(smsid, ticketType)
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
	if code != entry.Code || mobile != entry.UserData {
		entry.Failed += 1
		ticket.Add(smsid, ticketType, entry)
		return fmt.Errorf("验证失败，验证码不匹配")
	}
	// 验证通过，删除记录
	return ticket.Del(smsid, ticketType)
}
