package email

import "github.com/lucky-byte/bdb/serve/db"

// 查询所有邮件传输代理
func mtas() ([]db.MTA, error) {
	ql := `select * from mtas order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// 查询邮件标题前缀
func prefix() (string, error) {
	ql := `select mail_prefix from settings`
	var result db.Setting

	if err := db.SelectOne(ql, &result); err != nil {
		return "", err
	}
	return result.MailPrefix, nil
}
