package sms

import (
	"fmt"

	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/db"
)

// 查询短信配置
func getSettings() (*db.SmsSetting, error) {
	ql := `select * from sms_settings`
	var setting db.SmsSetting

	if err := db.SelectOne(ql, &setting); err != nil {
		return nil, errors.Wrap(err, "查询短信配置错")
	}
	if len(setting.AppId) == 0 {
		return nil, fmt.Errorf("未配置 SDK AppId")
	}
	if len(setting.SecretId) == 0 {
		return nil, fmt.Errorf("未配置 Secret Id")
	}
	if len(setting.SecretKey) == 0 {
		return nil, fmt.Errorf("未配置 Secret Key")
	}
	if len(setting.Sign) == 0 {
		return nil, fmt.Errorf("未配置短信签名")
	}
	return &setting, nil
}
