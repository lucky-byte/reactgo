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

// fatal same as fmt.Fatal(), print error message and exit
func fatal(format string, args ...any) {
	msg := fmt.Sprintf(format, args...)
	fmt.Println()
	color.Red(msg)
	fmt.Println()
	os.Exit(1)
}

// addConsoleUser add console user to database directly.
// This command is only use to add the first user(in the initialization phase)
func addConsoleUser(conf *config.ViperConfig) {
	db.Connect(conf.DatabaseDriver(), conf.DatabaseDSN())

	fmt.Println("Welcome to BDB!")
	fmt.Println()
	fmt.Println("请按照下面的提示创建第一个管理员账号.")
	fmt.Println("请确认录入正确的手机号和邮箱地址，将在登录时用于接收验证码.")

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

	// Generate random password
	passwd := password.MustGenerate(20, 6, 0, false, true)

	// Add user to database
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
}

// readLine Read one line from stdin
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

// hasUser check if user exist
func hasUser() bool {
	var count int

	err := db.Default().Get(&count, "select count(*) from users")
	if err != nil {
		fatal("Database error: %v", err)
	}
	return count > 0
}

// addNewUser add new user to database
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
	return db.ExecOne(
		ql, uuid.NewString(), userid, userid, email, mobile, passwdHash, acl,
	)
}
