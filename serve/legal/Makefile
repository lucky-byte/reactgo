# 生成 privacy.html 和 terms.html，需要安装 pandoc 工具
# 也可以使用其它工具生成 html，不采用这里的命令
all: privacy.md terms.md
	pandoc privacy.md -f markdown -t html -s -o privacy.html
	pandoc terms.md -f markdown -t html -s -o terms.html

.PHONY: all
