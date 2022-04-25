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
func authorization(r []byte, t int64, sms *db.SMS) string {
	h := fmt.Sprintf("content-type:application/json\nhost:%s\n", host)
	i := fmt.Sprintf("POST\n/\n\n%s\n%s\n%s", h, headers, hex256(r))

	d := time.Unix(t, 0).UTC().Format("2006-01-02")
	s := fmt.Sprintf("%s/%s/tc3_request", d, service)

	si := fmt.Sprintf("%s\n%d\n%s\n%s", algorithm, t, s, hex256([]byte(i)))

	sd := hmacsha256(d, "TC3"+sms.SecretKey)
	sv := hmacsha256(service, sd)
	ss := hmacsha256("tc3_request", sv)
	sign := hex.EncodeToString([]byte(hmacsha256(si, ss)))

	return fmt.Sprintf("%s Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		algorithm, sms.SecretId, s, headers, sign,
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
func sendWithTencent(mobile []string, tid string, params []string, sms *db.SMS) error {
	if len(sms.AppId) == 0 || len(sms.Prefix) == 0 ||
		len(sms.SecretId) == 0 || len(sms.SecretKey) == 0 {
		return fmt.Errorf("腾讯云短信服务配置不完整")
	}
	p := map[string]interface{}{
		"PhoneNumberSet":   mobile,
		"SmsSdkAppId":      sms.AppId,
		"SignName":         sms.Prefix,
		"TemplateId":       tid,
		"TemplateParamSet": params,
	}
	b, err := json.Marshal(p)
	if err != nil {
		return errors.Wrap(err, "json marshal 错")
	}
	xlog.X.Infof("发送腾讯云短信请求: %s", b)

	t := time.Now().Unix()
	a := authorization(b, t, sms)

	req, err := http.NewRequest("POST", "https://"+host, bytes.NewBuffer(b))
	if err != nil {
		return errors.Wrap(err, "发送腾讯云短信错")
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
	xlog.X.Infof("发送腾讯云短信响应: %s", body)

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
