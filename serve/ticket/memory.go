package ticket

import (
	"fmt"
	"strings"
	"sync"
	"time"
)

// 内存缓存，重启后失效
type memoryTicket struct {
	cache sync.Map
}

// 添加
func (m *memoryTicket) add(k, t string, e *TicketEntry) error {
	key := t + k

	m.cache.Store(key, e)
	return nil
}

// 删除
func (m *memoryTicket) del(k, t string) error {
	key := t + k

	if _, loaded := m.cache.LoadAndDelete(key); !loaded {
		return fmt.Errorf("删除 ticket 错误: %s 不存在", key)
	}
	return nil
}

// 获取
func (m *memoryTicket) get(k, t string) (*TicketEntry, error) {
	defer m.clean()

	key := t + k

	v, ok := m.cache.Load(key)
	if !ok {
		return nil, fmt.Errorf("ticket %s 不存在", key)
	}
	entry, ok := v.(*TicketEntry)
	if !ok {
		return nil, fmt.Errorf("ticket %s 无效", key)
	}
	return entry, nil
}

// 查找
func (m *memoryTicket) find(t string) []*TicketEntry {
	r := []*TicketEntry{}

	m.cache.Range(func(k, v any) bool {
		key := k.(string)
		value := v.(*TicketEntry)

		if strings.HasPrefix(key, t) {
			r = append(r, value)
		}
		return true
	})
	return r
}

// 清理
func (m *memoryTicket) clean() {
	m.cache.Range(func(key, v any) bool {
		if entry, ok := v.(*TicketEntry); ok {
			if time.Now().Unix() > entry.ExpiryAt {
				m.cache.Delete(key)
			}
		}
		return true
	})
}
