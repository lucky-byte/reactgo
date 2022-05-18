package config

import (
	"os/user"
	"path/filepath"
	"strings"
)

// 展开 ~(tilde) 字符，例如 ~/log 展开为 $HOME/log
func tildeExpand(p string) string {
	usr, _ := user.Current()
	dir := usr.HomeDir

	if p == "~" {
		p = dir
	} else if strings.HasPrefix(p, "~/") {
		p = filepath.Join(dir, p[2:])
	}
	return p
}
