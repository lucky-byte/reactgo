package main

import (
	"context"
	"crypto/tls"
	"embed"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"runtime"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/fatih/color"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echo_log "github.com/labstack/gommon/log"
	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/net/http2"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/lucky-byte/reactgo/serve/config"
	"github.com/lucky-byte/reactgo/serve/ctx"
	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/event"
	"github.com/lucky-byte/reactgo/serve/image"
	"github.com/lucky-byte/reactgo/serve/legal"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/nats"
	"github.com/lucky-byte/reactgo/serve/route/admin"
	"github.com/lucky-byte/reactgo/serve/route/login"
	"github.com/lucky-byte/reactgo/serve/route/oauth"
	"github.com/lucky-byte/reactgo/serve/route/public"
	"github.com/lucky-byte/reactgo/serve/task"
	"github.com/lucky-byte/reactgo/serve/ticket"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 从 -X 编译器选项获取
var Name, Version, BuildDate, BuildYear string

// 命令行选项
var (
	configFile = flag.String("config", "", "配置`文件路径`")
	webfs      = flag.String("webfs", "embed", "WEB资产, 可以是'embed'或者'osdir'")
	mailFS     = flag.String("mailfs", "embed", "邮件模板, 可以是'embed'或者'osdir'")
	master     = flag.Bool("master", true, "是否为主服务器")
	version    = flag.Bool("version", false, "打印版本信息")
	addUser    = flag.Bool("adduser", false, "添加第一个管理员")
)

func init() {
	flag.Usage = func() {
		name := color.MagentaString(Name)

		fmt.Fprintf(flag.CommandLine.Output(), "%s %s(%s)", name, Version, BuildDate)
		fmt.Fprint(flag.CommandLine.Output(), "\n\n")
		flag.PrintDefaults()
	}
}

//go:embed web
var embededWebFS embed.FS

// WEB 静态文件目录，可以通过配置修改
var web_directory = "./web"

// HTTP 引擎
var engine *echo.Echo

func main() {
	// 解析命令行选项
	flag.Parse()

	// 打印版本信息
	if *version {
		printVersion()
		os.Exit(0)
	}

reboot:
	// 从文件中加载配置
	conf, err := config.Load(*configFile, *master)
	if err != nil {
		log.Fatalf("加载配置文件错: %v", err)
	}
	// 连接数据库，如果失败将会 panic
	db.Connect(conf.DatabaseDriver(), conf.DatabaseDSN())

	// 从数据库加载配置
	loadDBConfig(conf)

	// 添加用户，然后退出
	if *addUser {
		addFirstUser(conf)
		return
	}
	debug := conf.Debug()

	// 设置邮件模板文件系统类型
	mailfs.SetFSType(*mailFS)

	// 确保日志文件存在
	logpath := conf.LogPath()
	if err = os.MkdirAll(logpath, 0755); err != nil {
		log.Fatalf("创建目录 '%s' 错: %v", logpath, err)
	}
	// 设置 xlog
	xlog.Setup(debug, conf)

	// 日志记录到事件表
	xlog.X.AddHook(event.NewEventHook(event.FormatJson))

	// 验证码
	ticket.Init(conf)

	// 连接 nats 服务器
	if err = nats.Connect(conf); err != nil {
		log.Fatalf("%v", err)
	}

	engine = echo.New()
	engine.Debug = debug
	engine.HideBanner = true
	engine.HTTPErrorHandler = httpErrorHandler

	// 基础中间件
	engine.Use(middleware.Recover())
	engine.Use(middleware.RequestID())

	// 限制请求报文大小
	engine.Use(middleware.BodyLimit("10M"))

	// 回滚日志文件
	// Echo 的日志和 Go log 的日志将保存到 misc.log 文件中
	rotate_logger_msic := &lumberjack.Logger{
		Filename:  path.Join(logpath, "misc.log"),
		MaxSize:   20,
		Compress:  true,
		LocalTime: true,
	}

	// 日志格式
	log.SetFlags(log.Lshortfile | log.Ldate | log.Lmicroseconds)
	engine.Logger.SetHeader("${time_rfc3339_nano} ${level} ${short_file}:${line}")

	if debug {
		writer := io.MultiWriter(rotate_logger_msic, os.Stdout)
		log.SetOutput(writer)
		engine.Logger.SetOutput(writer)
		engine.Logger.SetLevel(echo_log.DEBUG)
	} else {
		log.SetOutput(rotate_logger_msic)
		engine.Logger.SetOutput(rotate_logger_msic)
		engine.Logger.SetLevel(echo_log.INFO)
	}

	// 设置 HTTP 日志
	engine.Use(httpLogMiddleware(debug, logpath))

	// 自定义 Context
	engine.Use(ctx.Middleware(conf))

	// 输出请求和响应详情
	if debug && !conf.Dev() {
		engine.Use(debugMiddleware)
	}
	// WEB 静态文件
        // Gzip 插件压缩后浏览器不能正确解码
	// engine.Use(middleware.GzipWithConfig(middleware.GzipConfig{
	// 	Skipper: func(c echo.Context) bool {
	// 		if strings.ToUpper(c.Request().Method) == "GET" {
	// 			urlpath := c.Request().URL.Path

	// 			if strings.HasPrefix(urlpath, "/static/js/") {
	// 				return false
	// 			}
	// 		}
	// 		return true
	// 	},
	// }))
	// 执行文件中通过 gl:embed 打包了 WEB 静态文件
	// 如果命令行选项 -webfs 设置为 osdir，那么使用文件系统中的 WEB 静态文件，
	// 而不是打包的静态文件，如果 -webfs 设置为 embed，则使用打包的静态文件
	if *webfs == "embed" {
		fsys, err := fs.Sub(embededWebFS, "web")
		if err != nil {
			xlog.X.Fatalf("不能加载嵌入的 WEB 静态文件: %v", err)
		}
		handler := echo.WrapHandler(http.FileServer(http.FS(fsys)))

		list, err := fs.ReadDir(fsys, ".")
		if err != nil {
			xlog.X.Fatalf("读嵌入 WEB 目录错 %v", err)
		}
		for _, f := range list {
			if f.Type().IsRegular() {
				engine.GET("/"+f.Name(), handler)
			}
			if f.Type().IsDir() {
				engine.GET("/"+f.Name()+"/*", handler)
			}
		}
	} else {
		webdir := conf.ServerWebdir()
		if len(webdir) > 0 {
			if info, err := os.Stat(webdir); err != nil || !info.IsDir() {
				xlog.X.Fatalf("WEB 目录 '%s' 不是一个目录", webdir)
				return
			}
			web_directory = webdir
		}
		engine.Static("/", web_directory)
	}

	// CSRF token
	engine.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSecure:   conf.ServerSecure(),
		CookieSameSite: http.SameSiteStrictMode,
		TokenLookup:    "header:X-Csrf-Token",
		Skipper: func(c echo.Context) bool {
			return false
		},
	}))

	legal.Attach(engine)       // 隐私政策/服务条款
	image.Attach(engine, conf) // 图片

	// 速率限制
	rlconfig := middleware.DefaultRateLimiterConfig
	rlconfig.Store = middleware.NewRateLimiterMemoryStore(20)
	rlconfig.Skipper = func(c echo.Context) bool {
		// GET 方法不限制
		return c.Request().Method == http.MethodGet
	}
	engine.Use(middleware.RateLimiterWithConfig(rlconfig))

	login.Attach(engine, conf)  // 用户登录
	oauth.Attach(engine, conf)  // OAuth 客户端登录
	admin.Attach(engine, conf)  // 后台管理
	public.Attach(engine, conf) // 公开访问

	// 打印所有路由
	if debug {
		routes := engine.Routes()

		sort.SliceStable(routes, func(i, j int) bool {
			return routes[i].Path < routes[j].Path
		})
		sb := strings.Builder{}

		for i, v := range routes {
			arr := strings.Split(v.Name, "/")
			fn := arr[len(arr)-1]
			if fn != "v4.glob..func1" {
				sb.WriteString(
					fmt.Sprintf("\n%4d %6s %-42s %s", i, v.Method, v.Path, fn),
				)
			}
		}
		log.Printf("%s\n", sb.String())
	}
	// 在 goroutine 中启动服务器，这样主 goroutine 不会阻塞
	go startup(conf)

	// 主服务器启动任务调度
	if *master {
		if err = task.Startup(conf); err != nil {
			xlog.X.WithError(err).Fatal("启动任务调度失败")
		}
	}
	// 捕获系统信号，优雅的退出
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)
	s := <-quit

	xlog.X.Infof("接收到信号 %s", s.String())

	// 当收到信号时停止服务器
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := engine.Shutdown(ctx); err != nil {
		xlog.X.WithError(err).Fatal("强制关闭服务器")
	}
	task.Stop()
	db.Disconnect()
	nats.Drain()

	// SIGHUP 导致服务器重启
	if s == syscall.SIGHUP {
		goto reboot
	}
}

// 在单独的 goroutine 中启动 http 服务
func startup(conf *config.ViperConfig) {
	bind := conf.ServerBind()
	secure := conf.ServerSecure()

	if len(bind) == 0 {
		if secure {
			bind = ":https"
		} else {
			bind = ":http"
		}
	}
	// 不安全的 http 服务器
	// 启动 http/2 cleartext 服务器(HTTP2 over HTTP)
	if !secure {
		h2s := &http2.Server{
			MaxReadFrameSize:     1024 * 1024 * 5,
			MaxConcurrentStreams: 250,
			IdleTimeout:          10 * time.Second,
		}
		log.Printf("HTTP 服务 %d 准备就绪, 监听地址 %s\n", os.Getpid(), bind)

		if err := engine.StartH2CServer(bind, h2s); err != nil {
			if errors.Is(err, http.ErrServerClosed) {
				engine.Logger.Debug("服务器关闭, 清理...")
			} else {
				xlog.X.WithError(err).Fatalf("启动服务器错: %v", err)
			}
		}
	} else {
		// 安全 https 服务器，支持 HTTP/1.1 和 HTTP2
		var tlsconfig *tls.Config

		// 自动从 Let's Encrypt 或其他支持 ACME 的 CA 获取证书
		if conf.ServerAutoTLSEnabled() {
			domains := conf.ServerAutoTLSDomains()
			if len(domains) == 0 {
				xlog.X.Fatal("已启用 autotls, 但没有配置 doamins")
			}
			cachedir := conf.ServerAutoTLSCachedir()

			manager := autocert.Manager{
				Prompt:      autocert.AcceptTOS,
				Email:       conf.ServerAutoTLSEmail(),
				Cache:       autocert.DirCache(cachedir),
				HostPolicy:  autocert.HostWhitelist(domains...),
				RenewBefore: 20,
			}
			tlsconfig = manager.TLSConfig()
			tlsconfig.MinVersion = tls.VersionTLS11
		} else {
			tlskey := conf.ServerTLSKey()
			tlscrt := conf.ServerTLSCrt()

			if len(tlskey) == 0 || len(tlscrt) == 0 {
				xlog.X.Fatal("配置缺少 tlscrt 或 tlskey")
			}
			// 从 pem 文件加载证书和私钥，不支持加密的私钥
			c, err := tls.LoadX509KeyPair(tlscrt, tlskey)
			if err != nil {
				xlog.X.Fatalf("打开 PEM 文件错: %v", err)
			}
			tlsconfig = &tls.Config{
				MinVersion:   tls.VersionTLS11,
				Certificates: []tls.Certificate{c},
			}
		}
		hs := http.Server{
			TLSConfig: tlsconfig,
			Addr:      bind,
			Handler:   engine,
		}
		log.Printf("HTTPS 服务 %d 准备就绪, 监听地址 %s\n", os.Getpid(), bind)

		err := hs.ListenAndServeTLS("", "")
		if err != nil {
			if errors.Is(err, http.ErrServerClosed) {
				engine.Logger.Debug("服务器关闭, 清理...")
			} else {
				xlog.X.WithError(err).Fatalf("启动服务器错: %v", err)
			}
		}
	}
}

// HTTP 错误处理
func httpErrorHandler(err error, c echo.Context) {
	url := c.Request().URL.String()
	method := c.Request().Method

	// 前端是使用客户端路由的 React 应用，为了支持用户从任意路径访问，例如 /some/place
	// (/some/place 是客户端路由)，需要响应 index.html 而不是 404
	if e, ok := err.(*echo.HTTPError); ok {
		if e.Code == 404 && method == http.MethodGet {
			accept := c.Request().Header["Accept"]
			if len(accept) > 0 && strings.Contains(accept[0], "text/html") {
				xlog.F("url", url).Infof("%s 未找到, 返回 index.html", url)
				if *webfs == "embed" {
					content, err := fs.ReadFile(embededWebFS, "web/index.html")
					if err != nil {
						xlog.X.Errorf("读 web/index.html 错: %v", err)
						c.NoContent(http.StatusInternalServerError)
						return
					}
					c.HTML(http.StatusOK, string(content))
				} else {
					c.Response().Status = http.StatusOK
					c.File(path.Join(web_directory, "index.html"))
				}
				return
			}
		}
	}
	xlog.F("url", url, "method", method, "error", err).Errorf("HTTP服务错误: %v", err)

	// 默认错误处理
	c.Echo().DefaultHTTPErrorHandler(err, c)
}

// 打印版本信息
func printVersion() {
	name := color.MagentaString(Name)

	fmt.Printf("%s %s, %s, %s\n", name, Version, BuildDate, runtime.Version())
	fmt.Printf(`
Copyright (c) 2021-%s Lucky Byte, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`, BuildYear)
}

// 加载数据库配置
func loadDBConfig(c *config.ViperConfig) {
	// 诊断模式配置
	ql := `select debug from debug limit 1`
	var debug bool

	err := db.SelectOne(ql, &debug)
	if err != nil {
		log.Panicf("Read debug config error: %v", err)
	}
	c.SetDebug(debug)

	// 图片存储配置
	ql = `select * from image_store limit 1`
	var store db.ImageStore

	err = db.SelectOne(ql, &store)
	if err != nil {
		log.Panicf("Read image store config error: %v", err)
	}
	c.SetImagePlace(store.Place)
	c.SetImageRootPath(store.RootPath)
}
