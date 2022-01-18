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

	"github.com/lucky-byte/bdb/serve/config"
	"github.com/lucky-byte/bdb/serve/ctx"
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/image"
	"github.com/lucky-byte/bdb/serve/route/api"
	"github.com/lucky-byte/bdb/serve/route/index"
	"github.com/lucky-byte/bdb/serve/xlog"
)

// take from -X compile option
var Name, Version, BuildDate, BuildYear string

// Command line options
var (
	configFile = flag.String("config", "", "配置`文件路径`")
	webfs      = flag.String("webfs", "embed", "WEB资产, 可以是'embed'或者'osdir'")
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

// Web assets directory, can be overwrite by configuration
var web_directory = "./web"

// Echo's http engine
var engine *echo.Echo

func main() {
	// Parse command line options
	flag.Parse()

	// Print version information
	if *version {
		printVersion()
		os.Exit(0)
	}
	// Load configuration
	conf, err := config.Load(*configFile)
	if err != nil {
		log.Fatalf("Failed to load configration: %v", err)
	}
	// Add console user and quit
	if *addUser {
		addConsoleUser(conf)
		return
	}
	debug := conf.Debug()

	// Ensure log path exists
	logpath := conf.LogPath()
	if err = os.MkdirAll(logpath, 0755); err != nil {
		log.Fatalf("Failed to mkdir '%s': %v", logpath, err)
	}
	// Setup xlog
	xlog.Setup(debug, conf)

	// Connect to database, will panic if connect failed
	db.Connect(conf.DatabaseDriver(), conf.DatabaseDSN())

	engine = echo.New()
	engine.Debug = debug
	engine.HideBanner = true
	engine.HTTPErrorHandler = httpErrorHandler

	// Base middleware
	engine.Use(middleware.Recover())
	engine.Use(middleware.RequestID())

	// Limit request body size
	engine.Use(middleware.BodyLimit("10M"))

	// csrf token
	engine.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		CookieName:     "csrf",
		CookiePath:     "/",
		CookieHTTPOnly: false,
		CookieSecure:   conf.ServerSecure(),
		CookieSameSite: http.SameSiteStrictMode,
		Skipper: func(c echo.Context) bool {
			return false
		},
	}))

	// Rotate log file
	// Echo's log and Go's log save to file misc.log
	rotate_logger_msic := &lumberjack.Logger{
		Filename:  path.Join(logpath, "bdb-misc.log"),
		MaxSize:   20,
		Compress:  true,
		LocalTime: true,
	}

	// log format
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

	// Setup http log
	engine.Use(httpLogMiddleware(debug, logpath))

	// Customized context
	engine.Use(ctx.Middleware(conf))

	// Serve web static assets
	engine.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			if strings.ToUpper(c.Request().Method) == "GET" {
				urlpath := c.Request().URL.Path

				if strings.HasPrefix(urlpath, "/static/js/") {
					return false
				}
				if strings.HasPrefix(urlpath, "/locales/") {
					return false
				}
			}
			return true
		},
	}))
	// the executable has web assets embeded in with go:embed
	// if -webfs option is set to osdir, then use external web assets instead of
	// embeded assets
	if *webfs == "embed" {
		fsys, err := fs.Sub(embededWebFS, "web")
		if err != nil {
			xlog.X.Fatalf("unable to load embed web assets: %v", err)
		}
		webfsHandler := http.FileServer(http.FS(fsys))

		engine.GET("/static/*", echo.WrapHandler(webfsHandler))
		engine.GET("/locales/*", echo.WrapHandler(webfsHandler))
	} else {
		webdir := conf.Webdir()
		if len(webdir) > 0 {
			if info, err := os.Stat(webdir); err != nil || !info.IsDir() {
				xlog.X.Fatalf("Webdir '%s' is not a directory", webdir)
				return
			}
			web_directory = webdir
		}
		engine.Static("/", web_directory)
	}

	index.Attach(engine)
	api.Attach(engine)
	image.Attach(engine)

	// Startup server in a goroutine so main goroutine won't block
	go startup(conf)

	// Catch signal to graceful showdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)

	s := <-quit

	xlog.X.Infof("received signal %s", s.String())

	// Stop the server when signal arrived
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := engine.Shutdown(ctx); err != nil {
		xlog.X.WithError(err).Fatal("Server forced to shutdown")
	}
	db.Disconnect()
}

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
	// insecure http server
	// start http/2 cleartext server(HTTP2 over HTTP)
	if !secure {
		h2s := &http2.Server{
			MaxReadFrameSize:     1024 * 1024 * 5,
			MaxConcurrentStreams: 250,
			IdleTimeout:          10 * time.Second,
		}
		xlog.X.Tracef("%d is ready, listen on %s", os.Getpid(), bind)

		if err := engine.StartH2CServer(bind, h2s); err != nil {
			if errors.Is(err, http.ErrServerClosed) {
				engine.Logger.Debug("Server closed, cleanup...")
			} else {
				xlog.X.WithError(err).Fatal("Listen error")
			}
		}
	} else {
		// secure https server, support both http 1.1 and http2
		var tlsconfig *tls.Config

		// automatic access to certificates from Let's Encrypt and
		// any other ACME-based CA.
		if conf.ServerAutoTLS() {
			domains := conf.ServerDomains()
			if len(domains) == 0 {
				xlog.X.Fatal("autotls is enabled, but no doamins found")
			}
			cachedir := conf.ServerCachedir()

			manager := autocert.Manager{
				Prompt:      autocert.AcceptTOS,
				Cache:       autocert.DirCache(cachedir),
				HostPolicy:  autocert.HostWhitelist(domains...),
				RenewBefore: 30,
			}
			tlsconfig = manager.TLSConfig()
			tlsconfig.MinVersion = tls.VersionTLS11
		} else {
			tlskey := conf.ServerTLSKey()
			tlscrt := conf.ServerTLSCrt()

			if len(tlskey) == 0 || len(tlscrt) == 0 {
				xlog.X.Fatal("configuration missing tlscrt or tlskey")
			}
			// load cert and key from pem file, DON'T support encrypted key
			c, err := tls.LoadX509KeyPair(tlscrt, tlskey)
			if err != nil {
				xlog.X.Fatalf("failed to load pem: %v", err)
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
		xlog.X.Tracef("%d is ready, listen on %s", os.Getpid(), bind)

		err := hs.ListenAndServeTLS("", "")
		if err != nil {
			if errors.Is(err, http.ErrServerClosed) {
				engine.Logger.Debug("Server closed, cleanup...")
			} else {
				xlog.X.WithError(err).Fatal("Listen error")
			}
		}
	}
}

// HTTP Error Handler
func httpErrorHandler(err error, c echo.Context) {
	url := c.Request().URL.String()

	// Since web front-end is a React SPA with client route, to support user
	// access from any path(like /some/place, /some/place is client route),
	// we need serve index.html rather than 404 not found
	if e, ok := err.(*echo.HTTPError); ok {
		if e.Code == 404 && c.Request().Method == http.MethodGet {
			accept := c.Request().Header["Accept"]
			if len(accept) > 0 && strings.Contains(accept[0], "text/html") {
				xlog.X.WithField("url", url).Warn("404 Not found, return index.html")
				if *webfs == "embed" {
					content, err := fs.ReadFile(embededWebFS, "web/index.html")
					if err != nil {
						xlog.X.Errorf("read web/index.html error: %v", err)
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
	xlog.F("url", url, "error", err).Error("Server error")
	// reportError(err, c)

	// Default error handler
	c.Echo().DefaultHTTPErrorHandler(err, c)
}

// print version information
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
