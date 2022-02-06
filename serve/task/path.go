package task

import (
	"fmt"
	"os"
	"path"
	"strings"
)

// 检查 path 是否有效
func IsPathValid(fpath string, task_type int) error {
	if task_type == 1 {
		if findFunc(fpath) == nil {
			return fmt.Errorf("函数'%s'不存在", fpath)
		}
		return nil
	}
	// 支持带有选项的命令
	args := strings.Fields(fpath)
	p := args[0]

	if !path.IsAbs(p) {
		p = path.Join(scheduler.conf.TaskPath(), p)
	}
	// 检查文件是否存在并可以执行
	i, err := os.Stat(p)
	if err != nil {
		return err
	}
	if i.IsDir() {
		return fmt.Errorf("%s 不是常规文件", p)
	}
	if i.Mode().Perm()&0100 == 0 {
		return fmt.Errorf("%s 不是可执行文件", p)
	}
	return nil
}
