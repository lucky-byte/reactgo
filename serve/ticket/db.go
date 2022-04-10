package ticket

import (
	"time"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 数据库缓存
type dbTicket struct {
}

// 添加
func (d *dbTicket) Set(k string, e *TicketEntry) error {
	ql := `
		insert into tickets (
			keyid, create_at, expiry_at, code, failed, user_data
		) values (?,?,?,?,?,?) on conflict (keyid) do update set
			create_at = ?,
			expiry_at = ?,
			code = ?,
			failed = ?,
			user_data = ?
	`
	return db.ExecOne(ql, k,
		e.CreateAt, e.ExpiryAt, e.Code, e.Failed, e.UserData,
		e.CreateAt, e.ExpiryAt, e.Code, e.Failed, e.UserData,
	)
}

// 删除
func (d *dbTicket) Del(k string) error {
	ql := `delete from tickets where keyid = ?`
	return db.ExecOne(ql, k)
}

// 获取
func (d *dbTicket) Get(k string) (*TicketEntry, error) {
	ql := `select * from tickets where keyid = ?`
	var e TicketEntry

	err := db.SelectOne(ql, &e, k)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

// 遍历
func (d *dbTicket) Range(f func(k string, e *TicketEntry) bool) {
	ql := `select * from tickets`
	var es []TicketEntry

	if err := db.Select(ql, &es); err != nil {
		xlog.X.WithError(err).Error("查询 tickets 错")
		return
	}
	for _, e := range es {
		if f(e.KeyID, &e) {
			return
		}
	}
}

// 清理
func (d *dbTicket) Clean() {
	ql := `delete from tickets where expiry_at < ?`

	if err := db.Exec(ql, time.Now().Unix()); err != nil {
		xlog.X.WithError(err).Error("清理 tickets 错")
	}
}
