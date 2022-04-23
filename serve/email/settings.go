package email

import "github.com/lucky-byte/reactgo/serve/db"

// 查询所有邮件传输代理
func mtas() ([]db.MTA, error) {
	ql := `select * from mtas where disabled = false order by sortno`
	var result []db.MTA

	if err := db.Select(ql, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// 更新邮件发送量
func updateSent(uuid string) error {
	ql := `update mtas set nsent = nsent + 1 where uuid = ?`

	return db.ExecOne(ql, uuid)
}
