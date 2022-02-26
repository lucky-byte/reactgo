package sms

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

const (
	host      = "sms.tencentcloudapi.com"
	algorithm = "TC3-HMAC-SHA256"
	service   = "sms"
	version   = "2021-01-11"
	action    = "SendSms"
	region    = "ap-nanjing"
	headers   = "content-type;host"
)

func hex256(i []byte) string {
	b := sha256.Sum256(i)
	return hex.EncodeToString(b[:])
}

func hmacsha256(s, key string) string {
	hashed := hmac.New(sha256.New, []byte(key))
	hashed.Write([]byte(s))
	return string(hashed.Sum(nil))
}

// 计算 Authorization 签名
func authorization(r []byte, t int64, settings *db.SmsSetting) string {
	h := fmt.Sprintf("content-type:application/json\nhost:%s\n", host)
	i := fmt.Sprintf("POST\n/\n\n%s\n%s\n%s", h, headers, hex256(r))

	d := time.Unix(t, 0).UTC().Format("2006-01-02")
	s := fmt.Sprintf("%s/%s/tc3_request", d, service)

	si := fmt.Sprintf("%s\n%d\n%s\n%s", algorithm, t, s, hex256([]byte(i)))

	sd := hmacsha256(d, "TC3"+settings.SecretKey)
	sv := hmacsha256(service, sd)
	ss := hmacsha256("tc3_request", sv)
	sign := hex.EncodeToString([]byte(hmacsha256(si, ss)))

	return fmt.Sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		algorithm, settings.SecretId, s, headers, sign,
	)
}

type responseSendStatusSet struct {
	SerialNo    string
	PhoneNumber string
	Fee         int
	Code        string
	Message     string
}

type responseError struct {
	Code    string
	Message string
}

// 短信发送响应结构
type response struct {
	Response struct {
		SendStatusSet []responseSendStatusSet
		Error         responseError
		RequestId     string
	}
}

// 通过接口发送短信
func send(mobile []string, id string, params []string) error {
	settings, err := getSettings()
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
		return errors.Wrap(err, "json marshal 错")
	}
	xlog.X.Infof("发送短信请求: %s", b)

	t := time.Now().Unix()
	a := authorization(b, t, settings)

	req, err := http.NewRequest("POST", "https://"+host, bytes.NewBuffer(b))
	if err != nil {
		return errors.Wrap(err, "发送短信错")
	}
	req.Header.Set("Host", host)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", a)
	req.Header.Set("X-TC-Version", version)
	req.Header.Set("X-TC-Action", action)
	req.Header.Set("X-TC-Region", region)
	req.Header.Set("X-TC-Timestamp", strconv.FormatInt(t, 10))
	req.Header.Set("X-TC-Language", "zh-CN")

	// 发送 HTTP 请求
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return errors.Wrap(err, "HTTP POST 错")
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrap(err, "读取响应数据错")
	}
	xlog.X.Infof("发送短信响应: %s", body)

	var resp_json response

	if err = json.Unmarshal(body, &resp_json); err != nil {
		return errors.Wrap(err, "解析响应数据错")
	}
	e := resp_json.Response.Error

	if len(e.Code) > 0 && strings.ToLower(e.Code) != "ok" {
		return fmt.Errorf("%s", e.Message)
	}
	for _, v := range resp_json.Response.SendStatusSet {
		if strings.ToLower(v.Code) != "ok" {
			return fmt.Errorf("%s", v.Message)
		}
	}
	return nil
}

// 发送短信，id 是正文模板编号，params 是短信正文变量
func Send(mobile []string, id string, params []string) error {
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
	return send(mobile, id, params)
}
