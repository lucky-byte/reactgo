package sms

import (
	"encoding/hex"
	"fmt"
	"net/http"
	"regexp"

	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/secure"
	"github.com/pkg/errors"
)

// 接口地址
const baseurl = "https://yun.tim.qq.com/v5/tlssmssvr/sendsms"

// 短信正文模板 ID 常数
const (
	IDVerifyCode = 1 // 验证码
)

// 查询短信配置
func getSettings() (*db.SmsSettings, error) {
	ql := `select * from sms_settings`
	var result db.SmsSettings

	if err := db.SelectOne(ql, &result); err != nil {
		return nil, errors.Wrap(err, "查询短信配置错")
	}
	return &result, nil
}

// 通过接口发送短信
func send(settings *db.SmsSettings, id string, params ...interface{}) error {
	bytes, err := secure.RandomBytes(16)
	if err != nil {
		return errors.Wrap(err, "生成随机数错")
	}
	random := hex.EncodeToString(bytes)

	url := fmt.Sprintf(
		"%s?sdkappid=%s&random=%s", baseurl, settings.AppId, random,
	)
	http.Post(url, "application/json", nil)
	return nil
}

// 发送短信，n 是正文模板下标(1代表 msgid1)，params 是短信正文变量
func Send(mobile string, n int, params ...interface{}) error {
	match, err := regexp.MatchString(`^1[0-9]{10}$`, mobile)
	if err != nil {
		return errors.Wrap(err, "检查手机号格式错")
	}
	if !match {
		return errors.Wrap(err, "手机号格式不正确")
	}
	// 获取短信配置
	settings, err := getSettings()
	if err != nil {
		return err
	}
	ids := []string{"", settings.MsgID1}

	if n > len(ids) {
		return fmt.Errorf("参数 n(%d) 指定的模板不存在", n)
	}
	if len(ids[n]) == 0 {
		return fmt.Errorf("短信正文模板 n(%d) 未配置", n)
	}
	return send(settings, ids[n], params...)
}
