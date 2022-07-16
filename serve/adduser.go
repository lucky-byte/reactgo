package main

import (
	"bufio"
	"fmt"
	"net/mail"
	"os"
	"regexp"
	"strings"
	"unicode"

	"github.com/fatih/color"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"github.com/sethvargo/go-password/password"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/secure"
)

// 打印错误信息，然后退出
func fatal(format string, args ...any) {
	msg := fmt.Sprintf(format, args...)
	fmt.Println()
	color.Red(msg)
	fmt.Println()
	os.Exit(1)
}

// 添加第一个管理员用户，用于初始化阶段
func addFirstUser(conf *config.ViperConfig) {
	bold := color.New(color.Bold)

	bold.Printf("Welcome to %s!\n\n", Name)
	fmt.Println("请按照下面的提示创建第一个管理员账号.")
	bold.Println("请录入正确的手机号和邮箱地址，将在登录时用于接收验证码.")

	if hasUser() {
		fatal("用户已存在，这个命令仅用于创建第一个管理员账号.")
	}
	reader := bufio.NewReader(os.Stdin)

	fmt.Println()
	fmt.Println("请输入用户名(aka 登录名):")
	username := readLine(reader, "用户名")

	fmt.Println()
	fmt.Println("请输入用户邮箱地址:")
	email := readLine(reader, "邮箱地址")
	if _, err := mail.ParseAddress(email); err != nil {
		fatal("%v", err)
	}

	fmt.Println()
	fmt.Println("请输入用户手机号:")
	mobile := readLine(reader, "手机号")
	matched, err := regexp.MatchString("^1[0-9]{10}$", mobile)
	if err != nil {
		fatal("验证手机号错: %v", err)
	}
	if !matched {
		fatal("手机号格式错误")
	}
	// 生成随机密码
	passwd := password.MustGenerate(20, 6, 0, false, true)

	// 添加用户
	err = addNewUser(username, email, mobile, passwd)
	if err != nil {
		fatal("添加用户错误: %v", err)
	}
	fmt.Println()
	color.Green("恭喜! 用户 '%s' 添加成功.", username)
	fmt.Println()
	fmt.Println("====================================")
	fmt.Printf("登录密码: %s\n", color.MagentaString(passwd))
	fmt.Println("====================================")
	fmt.Println()
	fmt.Printf("请使用上面的用户名和密码登录 %s\n\n", conf.ServerHttpURL())
}

// 从 stdin 读一行数据
func readLine(reader *bufio.Reader, name string) string {
	prompt := color.New(color.FgHiBlue)
	prompt.Print(name + ": ")

	line, err := reader.ReadString('\n')
	if err != nil {
		fatal("%v", err)
	}
	// Trim non-graphic characters
	s := strings.Map(func(r rune) rune {
		if unicode.IsGraphic(r) {
			return r
		}
		return -1
	}, line)

	if len(s) == 0 {
		fatal("%s 不能为空.", name)
	}
	return s
}

// 检查系统是否存在用户，如果存在用户，则该命令不能执行
func hasUser() bool {
	var count int

	err := db.Default().Get(&count, "select count(*) from users")
	if err != nil {
		fatal("Database error: %v", err)
	}
	return count > 0
}

// 将用户信息记录到数据库
func addNewUser(userid, email, mobile, passwd string) error {
	// generate hashed password with default algorithm
	passwdHash, err := secure.DefaultPHC().Hash(passwd)
	if err != nil {
		return err
	}
	if err != nil {
		return errors.Wrap(err, "json marshal")
	}
	ql := `select uuid from acl where code = 0`
	var acl string

	if err := db.SelectOne(ql, &acl); err != nil {
		return err
	}
	ql = `
		insert into users (uuid, userid, name, email, mobile, passwd, acl, tfa)
		values (?, ?, ?, ?, ?, ?, ?, false)
	`
	id := uuid.NewString()

	return db.ExecOne(ql, id, userid, userid, email, mobile, passwdHash, acl)
}
