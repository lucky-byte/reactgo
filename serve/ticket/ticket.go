package ticket

import "github.com/lucky-byte/reactgo/serve/config"

type TicketEntry struct {
	CreateAt int64  // 创建时间
	ExpiryAt int64  // 过期时间
	Code     string // 代码
	Failed   int    // 失败次数
	UserData string // 用户数据
}

type Ticket interface {
	add(k, t string, e *TicketEntry) error
	del(k, t string) error
	get(k, t string) (*TicketEntry, error)
	find(t string) []*TicketEntry
}

var tickets Ticket

func Init(conf *config.ViperConfig) {
	tickets = &memoryTicket{}
}

func Add(k, t string, e *TicketEntry) error {
	return tickets.add(k, t, e)
}

func Del(k, t string) error {
	return tickets.del(k, t)
}

func Get(k, t string) (*TicketEntry, error) {
	return tickets.get(k, t)
}

func Find(t string) []*TicketEntry {
	return tickets.find(t)
}
