package sms

import "github.com/lucky-byte/bdb/serve/db"

func Send(mobile string, id int, params ...interface{}) error {
	ql := `select * from sms_settings`
	var result db.SmsSettings

	err := db.SelectOne(ql, &result)
	if err != nil {
		return err
	}
	return nil
}
