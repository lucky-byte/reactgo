package mailfs

import (
	"embed"
	"fmt"
	"os"
	"path"
	"strings"
)

//go:embed t/html
//go:embed t/logo
var mailFS embed.FS

var fsType = "embed"

// 通过命令行选项修改
func SetFSType(fstype string) {
	fsType = fstype
}

// 读取邮件模板文件
func ReadHtml(name string) ([]byte, error) {
	if fsType == "embed" {
		fpath := path.Join("t", "html", name)

		if !strings.HasSuffix(fpath, ".html") {
			fpath = fmt.Sprintf("%s.html", fpath)
		}
		return mailFS.ReadFile(fpath)
	} else {
		fpath := path.Join("mailfs", "t", "html", name)

		if !strings.HasSuffix(fpath, ".html") {
			fpath = fmt.Sprintf("%s.html", fpath)
		}
		return os.ReadFile(fpath)
	}
}

// 读取 LOGO
func ReadLogo() ([]byte, error) {
	if fsType == "embed" {
		fpath := path.Join("t", "logo", "lucky-byte.png")
		return mailFS.ReadFile(fpath)
	} else {
		fpath := path.Join("mailfs", "t", "logo", "lucky-byte.png")
		return os.ReadFile(fpath)
	}
}
