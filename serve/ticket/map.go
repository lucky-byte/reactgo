package ticket

import (
	"fmt"
	"sync"
	"time"
)

// 内存缓存，重启后失效
type mapTicket struct {
	cache sync.Map
}

// 添加或替换
func (m *mapTicket) Set(k string, e *TicketEntry) error {
	m.cache.Store(k, e)
	return nil
}

// 删除
func (m *mapTicket) Del(k string) error {
	if _, loaded := m.cache.LoadAndDelete(k); !loaded {
		return fmt.Errorf("删除 ticket 错误: %s 不存在", k)
	}
	return nil
}

// 获取
func (m *mapTicket) Get(k string) (*TicketEntry, error) {
	v, ok := m.cache.Load(k)
	if !ok {
		return nil, fmt.Errorf("ticket %s 不存在", k)
	}
	entry, ok := v.(*TicketEntry)
	if !ok {
		return nil, fmt.Errorf("ticket %s 无效", k)
	}
	return entry, nil
}

// 遍历
func (m *mapTicket) Range(f func(k string, v *TicketEntry) bool) {
	m.cache.Range(func(key, val any) bool {
		k := key.(string)
		v := val.(*TicketEntry)
		return f(k, v)
	})
}

// 清理
func (m *mapTicket) Clean() {
	m.cache.Range(func(k, v any) bool {
		if e, ok := v.(*TicketEntry); ok {
			if time.Now().Unix() > e.ExpiryAt {
				m.cache.Delete(k)
			}
		}
		return true
	})
}
