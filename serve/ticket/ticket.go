package ticket

import "github.com/lucky-byte/reactgo/serve/config"

type TicketEntry struct {
	KeyID    string `db:"keyid"`     // key
	CreateAt int64  `db:"create_at"` // 创建时间
	ExpiryAt int64  `db:"expiry_at"` // 过期时间
	Code     string `db:"code"`      // 代码
	Failed   int    `db:"failed"`    // 失败次数
	UserData string `db:"user_data"` // 用户数据
}

type ticket interface {
	Set(k string, e *TicketEntry) error
	Get(k string) (*TicketEntry, error)
	Del(k string) error
	Range(f func(t string, e *TicketEntry) bool)
	Clean()
}

var tickets ticket

// 在单实例模式下，是用内存缓存 tickets，在集群模式下，使用数据库存储 tickets 可以共享
func Init(conf *config.ViperConfig) {
	if conf.ServerCluster() {
		tickets = &dbTicket{}
	} else {
		tickets = &mapTicket{}
	}
}

// 增加记录，如果存在则更新, t 是记录的 key
func Set(k string, e *TicketEntry) error {
	return tickets.Set(k, e)
}

// 删除记录
func Del(k string) error {
	return tickets.Del(k)
}

// 获取记录
func Get(k string) (*TicketEntry, error) {
	defer tickets.Clean() // 删除过期的数据
	return tickets.Get(k)
}

// 遍历
func Range(f func(k string, e *TicketEntry) bool) {
	tickets.Range(f)
}
