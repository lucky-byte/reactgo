# ReactGo 使用指南

1. 创建操作系统用户 `reactgo`，命令如下：

   ```
   sudo useradd reactgo
   ```

   将来所有的操作使用此用户，某些操作需要特权，请将 `reactgo` 用户添加到 sudo 列表中，
   不要使用 `root` 用户。

1. 将 `reactgo.tar.gz` 上传到 `reactgo` 用户的 HOME 目录中，然后解压：

   ```bash
   # 上传文件，本地执行 scp，或者使用其它工具上传都可以
   scp reactgo.tar.gz reactgo@host:

   # 登录服务器
   ssh host
   ...login...

   # 解压
   tar xf reactgo.tar.gz
   ```

1. 将 `reactgo/bin` 目录添加到 `PATH` 环境变量中，例如在 `.bash_profile` 文件中，添加：

   ```bash
   export PATH=$HOME/reactgo/bin:$PATH
   ```

   上面 `$HOME/reactgo/bin` 是一个假设，请根据实际路径进行调整。

1. `reactgo/bin` 目录中 `migrate` 可能还未解压，使用下面的命令解压：

   ```bash
   cd reactgo/bin
   tar xf migrate.tar.gz
   ```

## 安装数据库服务器

当前支持 PostgreSQL v13 数据库服务器，请安装官方文档进行安装。

## 初始化数据库

1. 创建数据库，注意不使用 reactgo 作为数据库名是可以的，但是在其它地方（例如配置文件）
   也要对应进行修改。

   ```bash
   createdb reactgo
   ```

1. 初始化数据表，进入 `reactgo/migrate` 目录，检查一下 `migrate.sh` 文件的配置是否正确，
   然后执行：

   ```bash
   sh migrate.sh up
   ```

## 配置文件

配置文件内容请参考文档说明。

## 启动 ReactGo

在 `bin` 目录中有 2 个 reactgo 执行文件，其中一个带有 `dev` 后缀（表示开发版，
有更详细的日志），建议先使用这个验证一下是否都准备就绪。如果 `dev` 版可以正常运行，
再使用不带 `dev` 的版本运行。

启动命令：

```bash
migrate-linux-amd64 -config ~/reactgo/conf/config.yaml
```
