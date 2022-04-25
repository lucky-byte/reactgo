package sms

import (
	"fmt"
	"regexp"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
	"github.com/pkg/errors"
)

func Send(mobile []string, textno int, params []string) error {
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
	if textno < 1 || textno > 1 {
		return fmt.Errorf("textno %d 无效", textno)
	}
	ql := `select * from smss where disabled = false order by sortno`
	var smss []db.SMS

	if err := db.Select(ql, &smss); err != nil {
		return err
	}
	// 逐个尝试，遇到第一个成功发送的为止
	for _, s := range smss {
		err := SendWith(&s, mobile, textno, params)
		if err != nil {
			xlog.X.WithError(err).Errorf("通过 %s 发送短信错", s.ISP)
			continue
		}
		return nil
	}
	return fmt.Errorf("所有 %d 个短信服务商发送短信全部失败", len(smss))
}

func SendWith(sms *db.SMS, mobile []string, textno int, params []string) error {
	if sms.ISP == "tencent" {
		return sendWithTencent(mobile, textNo(sms, textno), params, sms)
	}
	return fmt.Errorf("短信运营商[%s][%s]不支持", sms.ISP, sms.ISPName)
}

func textNo(sms *db.SMS, textno int) string {
	switch textno {
	case 1:
		return sms.TextNo1
	default:
		xlog.X.Panicf("短信 textno %d 无效", textno)
		return ""
	}
}

// 发送短信验证码
func SendTextNo1(mobile []string, params []string) error {
	return Send(mobile, 1, params)
}
