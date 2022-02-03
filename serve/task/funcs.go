package task

type FuncEntry struct {
	Name  string
	Title string
	F     func()
}

var Funcs []*FuncEntry

func init() {
	Funcs = append(Funcs, &FuncEntry{
		Name:  "test",
		Title: "测试函数",
	})
}
