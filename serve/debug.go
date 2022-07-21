package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lucky-byte/reactgo/serve/ctx"
)

func debugMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cc := c.(*ctx.Context)

		debugDumpRequest(cc)

		res := c.Response()

		dumper := newDebugWriter(res)

		res.Before(func() {
			res.Writer = dumper
		})
		res.After(func() {
			res.Writer = dumper.origin
			dumper.dumpResponse(cc)
		})
		return next(c)
	}
}

// 记录请求
func debugDumpRequest(cc *ctx.Context) {
	req := cc.Request()
	res := cc.Response()

	reqid := res.Header().Get(echo.HeaderXRequestID)

	builder := strings.Builder{}

	builder.WriteString(fmt.Sprintf("\n%s %s\n", req.Method, req.URL.String()))
	builder.WriteString(fmt.Sprintf("id:%s\n", reqid))
	builder.WriteString("===============================================\n")

	debugDumpHeader(req.Header, &builder)

	body, err := io.ReadAll(req.Body)
	if err != nil {
		cc.ErrLog(err).Error("读取请求数据错")
		log.Println(builder.String())
		return
	}
	req.Body.Close()
	req.Body = io.NopCloser(bytes.NewBuffer(body))

	builder.WriteString(fmt.Sprintf("\n%s %s\n", req.Method, req.URL.String()))
	builder.WriteString(fmt.Sprintf("请求数据: %d 字节\nid:%s\n", len(body), reqid))
	builder.WriteString("===============================================\n")

	mimetype := req.Header.Get("content-type")

	if strings.HasPrefix(mimetype, echo.MIMEMultipartForm) {
		builder.WriteString(
			fmt.Sprintf("省略请求数据，因为 content-type 为 %s\n", mimetype),
		)
	} else {
		content, err := url.QueryUnescape(string(body))
		if err != nil {
			cc.ErrLog(err).Warn("解码请求数据错")
		} else {
			builder.WriteString(content)
			builder.WriteString("\n")
		}
	}
	log.Println(builder.String())
}

// 输出 HTTP 首部
func debugDumpHeader(header http.Header, builder *strings.Builder) {
	keys, i := make([]string, len(header)), 0

	for k := range header {
		keys[i] = k
		i += 1
	}
	sort.Strings(keys)

	for _, k := range keys {
		builder.WriteString(
			fmt.Sprintf("%s: %s\n", k, strings.Join(header[k], ",")),
		)
	}
}

type debugWriter struct {
	body   *bytes.Buffer
	origin http.ResponseWriter
	io.Writer
}

func newDebugWriter(r *echo.Response) *debugWriter {
	body := new(bytes.Buffer)

	return &debugWriter{
		body:   body,
		origin: r.Writer,
		Writer: io.MultiWriter(r.Writer, body),
	}
}

func (d *debugWriter) Header() http.Header {
	return d.origin.Header()
}

func (d *debugWriter) WriteHeader(code int) {
	d.origin.WriteHeader(code)
}

// 输出 HTTP 响应数据
func (d *debugWriter) dumpResponse(cc *ctx.Context) {
	req := cc.Request()
	res := cc.Response()

	reqid := res.Header().Get(echo.HeaderXRequestID)

	builder := strings.Builder{}

	builder.WriteString(fmt.Sprintf("\n%s %s\n", req.Method, req.URL.String()))
	builder.WriteString(fmt.Sprintf("响应状态: %d\nid:%s\n", res.Status, reqid))
	builder.WriteString("===============================================\n")

	debugDumpHeader(res.Header(), &builder)

	builder.WriteString(fmt.Sprintf("\n%s %s\n", req.Method, req.URL.String()))
	builder.WriteString(fmt.Sprintf("响应数据: %d 字节\nid:%s\n", res.Size, reqid))
	builder.WriteString("===============================================\n")

	mimetype := res.Header().Get("content-type")

	if strings.HasPrefix(mimetype, "image/") {
		builder.WriteString(fmt.Sprintf("略过内容，因为 content-type 为 %s", mimetype))
		return
	}
	if strings.HasPrefix(mimetype, "font/") {
		builder.WriteString(fmt.Sprintf("略过内容，因为 content-type 为 %s", mimetype))
		return
	}
	if strings.HasPrefix(mimetype, "text/javascript") {
		builder.WriteString(fmt.Sprintf("略过内容，因为 content-type 为 %s", mimetype))
		return
	}
	if strings.HasSuffix(req.URL.Path, ".js.map") {
		builder.WriteString(fmt.Sprintf("略过内容，因为 content-type 为 %s", mimetype))
		return
	}
	if strings.HasPrefix(mimetype, echo.MIMEApplicationJSON) {
		var r map[string]any

		err := json.Unmarshal(d.body.Bytes(), &r)
		if err != nil {
			cc.ErrLog(err).Warnf("解析请求 JSON 数据错")
			goto plain
		}
		b, err := json.MarshalIndent(r, "", "  ")
		if err != nil {
			cc.ErrLog(err).Warnf("格式化 JSON 数据错")
			goto plain
		}
		builder.WriteString(string(b))
		builder.WriteString("\n")

		log.Println(builder.String())
		return
	}
plain:
	builder.WriteString(d.body.String())
	builder.WriteString("\n")

	log.Println(builder.String())
}
