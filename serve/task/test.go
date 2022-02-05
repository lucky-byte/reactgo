package task

import "github.com/lucky-byte/reactgo/serve/xlog"

// 注册函数
func init() {
	Funcs = append(Funcs, &FuncEntry{"测试函数", "test", test})
}

func test() {
	xlog.X.Debug("I am tester")
}
