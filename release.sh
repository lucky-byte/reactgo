#!/bin/sh

# make a 'release' tarball to deploy on linux platform.

rm -fr reactgo
mkdir reactgo

pwd=$PWD

# 编译最新的执行文件 for Linux
mkdir -p reactgo/bin
cd serve && make linux && cd $pwd
mv serve/reactgo-linux-amd64 reactgo/bin/
mv serve/reactgo-linux-amd64-dev reactgo/bin/

# 复制一份配置文件
mkdir -p reactgo/conf
cp serve/config.yaml reactgo/conf/

# 下载 migrate 二进制 for Linux
# curl -L https://github.com/golang-migrate/migrate/releases/download/v4.15.1/migrate.linux-amd64.tar.gz > reactgo/bin/migrate.tar.gz

# 数据库脚本
cp -r migrate reactgo/

# 附带使用说明和授权协议
cp release.md reactgo/README.md
cp LICENSE reactgo/

# 准备就绪，打包
rm -fr reactgo.tar.gz
tar zcf reactgo.tar.gz reactgo
rm -fr reactgo
