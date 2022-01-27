package sms

// 发送短信验证码
func Code(mobile string) (string, error) {
	if err := Send([]string{mobile}, IDVerifyCode, nil); err != nil {
		return "", err
	}
	return "", nil
}
