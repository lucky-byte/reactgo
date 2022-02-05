package task

import (
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

func findFunc(path string) *FuncEntry {
	for _, f := range Funcs {
		if f.Path == path {
			return f
		}
	}
	return nil
}
