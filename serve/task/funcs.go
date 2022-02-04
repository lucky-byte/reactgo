package task

import (
	"fmt"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

type FuncEntry struct {
	Name string
	Path string
	Func func()
}

var Funcs []*FuncEntry

func test() {
	xlog.X.Debug("I am tester")
}

func init() {
	Funcs = append(Funcs, &FuncEntry{"测试函数", "test", test})
}

// 添加函数调度
func addFunc(t *db.Task) error {
	found := false

	for _, f := range Funcs {
		if f.Path == t.Path {
			if f.Func == nil {
				return fmt.Errorf("函数'%s'未定义函数", f.Name)
			}
			_, err := scheduler.cron.AddFunc(t.Cron, f.Func)
			if err != nil {
				return err
			}
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("未找到函数 %s", t.Path)
	}
	return nil
}
