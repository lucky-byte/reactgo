//go:build dev

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/labstack/echo/v4"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

// Dump request and response header and body
// Only for dev mode, that is, build with 'dev' tag
func init() {
	go func() {
		for {
			if engine != nil {
				engine.Use(dumpMiddleware)
				break
			}
			time.Sleep(1 * time.Second)
		}
	}()
	// disable the color by set color.NoColor = true
	color.NoColor = false
}

type dumpWriter struct {
	body   *bytes.Buffer
	origin http.ResponseWriter
	io.Writer
}

func newDumpWriter(r *echo.Response) *dumpWriter {
	body := new(bytes.Buffer)

	return &dumpWriter{
		body:   body,
		origin: r.Writer,
		Writer: io.MultiWriter(r.Writer, body),
	}
}

// Middleware to dump request and response
// The overhead of this middleware is considerable
func dumpMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		res := c.Response()

		// Dump request now, so we can read the request body
		dumpRequest(c.Request())

		dumper := newDumpWriter(res)

		res.Before(func() {
			res.Writer = dumper
		})

		res.After(func() {
			res.Writer = dumper.origin
			dumper.dumpResponse(c.Request(), res)
		})
		return next(c)
	}
}

// Dumb implemention
func (d *dumpWriter) Header() http.Header {
	return d.origin.Header()
}

// Dumb implemention
func (d *dumpWriter) WriteHeader(code int) {
	d.origin.WriteHeader(code)
}

// Dump request
// The color schema work well on black background
func dumpRequest(req *http.Request) {
	url := req.URL.String()

	body, err := io.ReadAll(req.Body)
	if err != nil {
		xlog.X.WithError(err).Error("Unable to read request body")
		return
	}
	req.Body.Close()
	req.Body = io.NopCloser(bytes.NewBuffer(body))

	reqC := color.New(color.FgHiGreen, color.Bold)

	fmt.Println()
	reqC.Printf("请求首部: %s %s\n", req.Method, url)
	reqC.Println("===============================================")
	dumpHeader(req.Header)

	fmt.Println()
	n := fmt.Sprintf("%d", len(string(body)))
	reqC.Printf("请求数据: %s %s %s bytes\n", req.Method, url, n)
	reqC.Println("===============================================")

	// Request mime type
	mimetype := req.Header.Get("content-type")

	// Don't dump multipart/form-data response body
	if strings.HasPrefix(mimetype, echo.MIMEMultipartForm) {
		color.HiRed("Skip beacuse content-type is %s\n", color.HiGreenString(mimetype))
	} else {
		color.HiMagenta(string(body))
	}
}

// Dump response
// The color schema work well on black background
func (d *dumpWriter) dumpResponse(req *http.Request, res *echo.Response) {
	url := req.URL.String()

	color.NoColor = false

	resC := color.New(color.FgHiMagenta, color.Bold)

	fmt.Println()
	resC.Printf("响应首部: %s %s %d\n", req.Method, url, res.Status)
	resC.Println("===============================================")
	dumpHeader(res.Header())

	fmt.Println()
	n := fmt.Sprintf("%d", res.Size)
	resC.Printf("响应数据: %s %s %s bytes\n", req.Method, url, n)
	resC.Println("===============================================")

	// Response mime type
	mimetype := res.Header().Get("content-type")

	if strings.HasPrefix(mimetype, "image/") {
		color.HiRed("Skip beacuse content-type is %s\n", color.HiGreenString(mimetype))
		return
	}
	if strings.HasPrefix(mimetype, "font/") {
		color.HiRed("Skip beacuse content-type is %s\n", color.HiGreenString(mimetype))
		return
	}
	if strings.HasPrefix(mimetype, "text/javascript") {
		color.HiRed("Skip beacuse content-type is %s\n", color.HiGreenString(mimetype))
		return
	}
	if strings.HasSuffix(url, ".js.map") {
		color.HiRed("Skip *.js.map beacuse it's content is too long\n")
		return
	}
	// display preview format if possible
	if strings.HasPrefix(mimetype, echo.MIMEApplicationJSON) {
		var r map[string]string

		if err := json.Unmarshal(d.body.Bytes(), &r); err == nil {
			color.HiRed("{")
			for k, v := range r {
				if len(v) <= 1001 {
					color.HiYellow("  %s: %s,", k, color.HiCyanString(v))
				} else {
					l := color.HiGreenString("%s bytes", fmt.Sprintf("%d", len(v)))
					color.HiYellow("  %s: %s...\n%s,", k, color.HiCyanString(v[:1000]), l)
				}
			}
			color.HiRed("}")
			return
		}
	}
	text := d.body.String()

	if len(text) <= 1001 {
		color.HiCyan("%s", text)
	} else {
		l := color.HiGreenString("%s bytes", fmt.Sprintf("%d", len(text)))
		color.HiCyan("%s...\n%s", text[:1000], l)
	}
}

// Dump header
// The output will be sort by header key
func dumpHeader(header http.Header) {
	keys, i := make([]string, len(header)), 0

	for k := range header {
		keys[i] = k
		i += 1
	}
	sort.Strings(keys)

	keyC := color.New(color.FgHiYellow)
	valC := color.New(color.FgHiCyan)

	for _, k := range keys {
		keyC.Print(k)
		fmt.Print(": ")
		valC.Println(strings.Join(header[k], ","))
	}
}
