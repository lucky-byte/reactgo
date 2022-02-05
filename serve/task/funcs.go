package task

type FuncEntry struct {
	Name string
	Path string
	Func func()
}

var Funcs []*FuncEntry

// 查找函数
func findFunc(path string) *FuncEntry {
	for _, f := range Funcs {
		if f.Path == path {
			return f
		}
	}
	return nil
}
