package sms

import (
	"fmt"
)

// 短信正文模板 ID 常数
const (
	IDVerifyCode = 1 // 验证码
)

// 获取短信正文模板编号
func MsgID(n int) (string, error) {
	settings, err := getSettings()
	if err != nil {
		return "", err
	}
	ids := []string{"", settings.MsgID1}

	if n > len(ids) {
		return "", fmt.Errorf("参数 n(%d) 指定的模板不存在", n)
	}
	id := ids[n]

	if len(id) == 0 {
		return "", fmt.Errorf("短信正文模板 n(%d) 未配置", n)
	}
	return id, nil
}

// 获取短信验证码的模板编号
func VerifyCodeId() (string, error) {
	return MsgID(IDVerifyCode)
}
