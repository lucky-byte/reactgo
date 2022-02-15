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
	"github.com/lucky-byte/reactgo/serve/image"
	"github.com/lucky-byte/reactgo/serve/mailfs"
	"github.com/lucky-byte/reactgo/serve/route/index"
	"github.com/lucky-byte/reactgo/serve/task"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// 从 -X 编译器选项获取
var Name, Version, BuildDate, BuildYear string

// 命令行选项
var (
	configFile = flag.String("config", "", "配置`文件路径`")
	webfs      = flag.String("webfs", "embed", "WEB资产, 可以是'embed'或者'osdir'")
	mailFS     = flag.String("mailfs", "embed", "邮件模板, 可以是'embed'或者'osdir'")
	cron       = flag.Bool("cron", true, "启动任务调度器")
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

//go:embed privacy.html
var privacy_html string

//go:embed terms.html
var terms_html string

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
	// 从文件中加载配置
	conf, err := config.Load(*configFile)
	if err != nil {
		log.Fatalf("加载配置文件错: %v", err)
	}
	// 添加用户，然后退出
	if *addUser {
		addConsoleUser(conf)
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

	// 连接数据库，如果失败将会 panic
	db.Connect(conf.DatabaseDriver(), conf.DatabaseDSN())

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

	// WEB 静态文件
	engine.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			if strings.ToUpper(c.Request().Method) == "GET" {
				urlpath := c.Request().URL.Path

				if strings.HasPrefix(urlpath, "/static/js/") {
					return false
				}
			}
			return true
		},
	}))
	// 执行文件中通过 gl:embed 打包了 WEB 静态文件
	// 如果命令行选项 -webfs 设置为 osdir，那么使用文件系统中的 WEB 静态文件，
	// 而不是打包的静态文件，如果 -webfs 设置为 embed，则使用打包的静态文件
	if *webfs == "embed" {
		fsys, err := fs.Sub(embededWebFS, "web")
		if err != nil {
			xlog.X.Fatalf("不能加载嵌入的 WEB 静态文件: %v", err)
		}
		handler := echo.WrapHandler(http.FileServer(http.FS(fsys)))

		engine.GET("/static/*", handler)
		engine.GET("/asset-manifest.json", handler)
		engine.GET("/favicon.png", handler)
		engine.GET("/logo192.png", handler)
		engine.GET("/logo512.png", handler)
		engine.GET("/manifest.json", handler)
		engine.GET("/robots.txt", handler)
	} else {
		webdir := conf.Webdir()
		if len(webdir) > 0 {
			if info, err := os.Stat(webdir); err != nil || !info.IsDir() {
				xlog.X.Fatalf("WEB 目录 '%s' 不是一个目录", webdir)
				return
			}
			web_directory = webdir
		}
		engine.Static("/", web_directory)
	}

	// 隐私政策
	engine.GET("/privacy", func(c echo.Context) error {
		return c.HTML(http.StatusOK, privacy_html)
	})
	// 服务条款
	engine.GET("/terms", func(c echo.Context) error {
		return c.HTML(http.StatusOK, terms_html)
	})

	// 图片
	image.Attach(engine)

	// 后台管理
	index.Attach(engine, conf)

	// 在 goroutine 中启动服务器，这样主 goroutine 不会阻塞
	go startup(conf)

	// 启动任务调度
	if *cron {
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
		xlog.X.Tracef("HTTP 服务 %d 准备就绪, 监听地址 %s", os.Getpid(), bind)

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
		xlog.X.Tracef("HTTPS 服务 %d 准备就绪, 监听地址 %s", os.Getpid(), bind)

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

	// 前端是使用客户端路由的 React 应用，为了支持用户从任意路径访问，例如 /some/place
	// (/some/place 是客户端路由)，需要响应 index.html 而不是 404
	if e, ok := err.(*echo.HTTPError); ok {
		if e.Code == 404 && c.Request().Method == http.MethodGet {
			accept := c.Request().Header["Accept"]
			if len(accept) > 0 && strings.Contains(accept[0], "text/html") {
				xlog.F("url", url).Warnf("%s 未找到, 返回 index.html", url)
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
	xlog.F("url", url, "error", err).Errorf("HTTP服务错误: %v", err)
	// reportError(err, c)

	// 默认错误处理
	c.Echo().DefaultHTTPErrorHandler(err, c)
}

// 打印版本信息
func printVersion() {
	name := color.MagentaString(Name)

	fmt.Printf("%s %s, %s, %s\n", name, Version, BuildDate, runtime.Version())
	fmt.Printf(`
Copyright (C) 2021-%s Lucky Byte, Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
`, BuildYear)
}
