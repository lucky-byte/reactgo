package sms

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"github.com/lucky-byte/bdb/serve/db"
	"github.com/pkg/errors"
)

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

// 获取短信正文模板编号
func msgid(settings *db.SmsSettings, n int) (string, error) {
	ids := []string{"", settings.MsgID1}

	if n > len(ids) {
		return "", fmt.Errorf("参数 n(%d) 指定的模板不存在", n)
	}
	if len(ids[n]) == 0 {
		return "", fmt.Errorf("短信正文模板 n(%d) 未配置", n)
	}
	return ids[n], nil
}

func hex256(i []byte) string {
	b := sha256.Sum256(i)
	return hex.EncodeToString(b[:])
}

func hmacsha256(s, key string) string {
	hashed := hmac.New(sha256.New, []byte(key))
	hashed.Write([]byte(s))
	return string(hashed.Sum(nil))
}

const (
	host      = "sms.tencentcloudapi.com"
	algorithm = "TC3-HMAC-SHA256"
	service   = "sms"
	version   = "2017-03-12"
	action    = "SendSms"
	region    = "ap-guangzhou"
	headers   = "content-type;host"
)

// 通过接口发送短信
func send(mobile []string, n int, params []string) error {
	settings, err := getSettings()
	if err != nil {
		return err
	}
	id, err := msgid(settings, n)
	if err != nil {
		return err
	}
	p := map[string]interface{}{
		"PhoneNumberSet":   mobile,
		"SmsSdkAppId":      settings.AppId,
		"SignName":         settings.Sign,
		"TemplateId":       id,
		"TemplateParamSet": params,
	}
	b, err := json.Marshal(p)
	if err != nil {
		return errors.Wrap(err, "json marshal")
	}
	h := fmt.Sprintf("content-type:application/json\nhost:%s\n", host)
	i := fmt.Sprintf("POST\n/\n\n%s\n%s\n%s", h, headers, hex256(b))

	t := time.Now().Unix()
	d := time.Unix(t, 0).UTC().Format("2006-01-02")
	s := fmt.Sprintf("%s/%s/tc3_request", d, service)

	si := fmt.Sprintf("%s\n%d\n%s\n%s", algorithm, t, s, hex256([]byte(i)))

	sd := hmacsha256(d, "TC3"+"secretKey")
	sv := hmacsha256(service, sd)
	ss := hmacsha256("tc3_request", sv)
	sign := hex.EncodeToString([]byte(hmacsha256(si, ss)))

	a := fmt.Sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		algorithm, "secretId", s, headers, sign,
	)
	fmt.Printf("auth: %s\n", a)
	return nil
}

// 发送短信，n 是正文模板下标(1代表 msgid1)，params 是短信正文变量
func Send(mobile []string, n int, params []string) error {
	if len(mobile) == 0 {
		return fmt.Errorf("手机号不能为空")
	}
	r, err := regexp.Compile(`^1[0-9]{10}$`)
	if err != nil {
		return errors.Wrap(err, "检查手机号格式错(编译正则表达式错误)")
	}
	for _, m := range mobile {
		if !r.MatchString(m) {
			return fmt.Errorf("手机号格式错误(%s)", m)
		}
	}
	return send(mobile, n, params)
}
