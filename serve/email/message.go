package email

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"mime"
	"net/mail"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/xlog"
)

// Attachment 邮件附件
type Attachment struct {
	Filename  string // filename
	Data      []byte // attachment data
	Inline    bool   // is inline
	ContentId string // content id
}

// Header 一个额外的邮件头
type Header struct {
	Key   string
	Value string
}

// Message SMTP 消息
type Message struct {
	To          []*mail.Address
	Cc          []*mail.Address
	Bcc         []*mail.Address
	ReplyTo     string
	Subject     string
	prefix      string
	Body        string
	BodyType    string
	Headers     []Header
	Attachments map[string]*Attachment
	hasInline   bool
}

// AddTO 添加一个收件人
func (m *Message) AddTO(address *mail.Address) []*mail.Address {
	m.To = append(m.To, address)
	return m.To
}

// AddCC 添加一个抄送收件人
func (m *Message) AddCC(address *mail.Address) []*mail.Address {
	m.Cc = append(m.Cc, address)
	return m.Cc
}

// AddBCC 添加一个密送收件人
func (m *Message) AddBCC(address *mail.Address) []*mail.Address {
	m.Bcc = append(m.Bcc, address)
	return m.Bcc
}

// AttachBuffer 添加一个二进制的附件
func (m *Message) AttachBuffer(filename string, buf []byte, inline bool, cid string) {
	m.Attachments[filename] = &Attachment{
		Filename:  filename,
		Data:      buf,
		Inline:    inline,
		ContentId: cid,
	}
	if inline {
		m.hasInline = true
	}
}

func (m *Message) attach(file string, inline bool, cid string) error {
	data, err := os.ReadFile(file)
	if err != nil {
		return err
	}
	_, filename := filepath.Split(file)

	m.Attachments[filename] = &Attachment{
		Filename:  filename,
		Data:      data,
		Inline:    inline,
		ContentId: cid,
	}
	if inline {
		m.hasInline = true
	}
	return nil
}

// Attach 添加一个文件作为附件
func (m *Message) Attach(file string) error {
	return m.attach(file, false, "")
}

// Inline 添加一个文件作为内联附件
func (m *Message) Inline(file string, cid string) error {
	return m.attach(file, true, cid)
}

// AddHeader 添加一个消息头
func (m *Message) AddHeader(key string, value string) Header {
	newHeader := Header{Key: key, Value: value}
	m.Headers = append(m.Headers, newHeader)
	return newHeader
}

// bytes 返回邮件数据
func (m *Message) bytes(sender *mail.Address) []byte {
	buf := bytes.NewBuffer(nil)

	buf.WriteString(fmt.Sprintf("From: %s\r\n", sender.String()))

	t := time.Now()
	buf.WriteString(fmt.Sprintf("Date: %s\r\n", t.Format(time.RFC1123Z)))

	buf.WriteString(fmt.Sprintf(
		"To: %s\r\n", strings.Join(addrs2strings(true, m.To), ","),
	))
	if len(m.Cc) > 0 {
		buf.WriteString(fmt.Sprintf(
			"Cc: %s\r\n", strings.Join(addrs2strings(true, m.Cc), ","),
		))
	}
	s := m.Subject
	if len(m.prefix) > 0 {
		s = fmt.Sprintf("%s %s", m.prefix, m.Subject)
	}
	coder := base64.StdEncoding
	subject := "=?UTF-8?B?" + coder.EncodeToString([]byte(s)) + "?="
	buf.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))

	if len(m.ReplyTo) > 0 {
		buf.WriteString(fmt.Sprintf("Reply-To: %s\r\n", m.ReplyTo))
	}
	buf.WriteString("MIME-Version: 1.0\r\n")

	// 添加自定义头
	if len(m.Headers) > 0 {
		for _, header := range m.Headers {
			buf.WriteString(fmt.Sprintf("%s: %s\r\n", header.Key, header.Value))
		}
	}
	// 写消息正文
	writeBody := func() {
		buf.WriteString(fmt.Sprintf(
			"Content-Type: %s; charset=utf-8\r\n\r\n", m.BodyType,
		))
		buf.WriteString(m.Body)
		buf.WriteString("\r\n")
	}
	// 没有附件，写完正文直接返回
	if len(m.Attachments) == 0 {
		writeBody()
		return buf.Bytes()
	}
	// 写入附件
	writeAttachment := func(attachment *Attachment) {
		ext := filepath.Ext(attachment.Filename)
		mimetype := mime.TypeByExtension(ext)
		if len(mimetype) > 0 {
			mime := fmt.Sprintf("Content-Type: %s\r\n", mimetype)
			buf.WriteString(mime)
		} else {
			buf.WriteString("Content-Type: application/octet-stream\r\n")
		}
		buf.WriteString("Content-Transfer-Encoding: base64\r\n")

		// 内联附件给定一个 content id，这样正文可以通过 cid 引用它
		if attachment.Inline {
			buf.WriteString(fmt.Sprintf("Content-ID: <%s>\r\n", attachment.ContentId))
			buf.WriteString(fmt.Sprintf(
				"Content-Disposition: inline; filename=\"%s\"\r\n\r\n",
				attachment.Filename,
			))
		} else {
			buf.WriteString("Content-Disposition: attachment; filename=\"=?UTF-8?B?")
			buf.WriteString(coder.EncodeToString([]byte(attachment.Filename)))
			buf.WriteString("?=\"\r\n\r\n")
		}
		b := make([]byte, base64.StdEncoding.EncodedLen(len(attachment.Data)))
		base64.StdEncoding.Encode(b, attachment.Data)

		// 每行最多 76 个字符的 base64 内容
		for i, l := 0, len(b); i < l; i++ {
			buf.WriteByte(b[i])
			if (i+1)%76 == 0 {
				buf.WriteString("\r\n")
			}
		}
	}
	// 生成随机的 mixed 边界
	mixed := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))

	// mixed 开始
	buf.WriteString(fmt.Sprintf(
		"Content-Type: multipart/mixed; boundary=%s\r\n", mixed,
	))
	buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", mixed))

	// 如果有内联附件，邮件将变成下面的结构
	// + mixed
	// | + alternative
	// | | + related
	// | | | - body
	// | | | - inline attachment 1
	// | | | - inline attachment 2
	// | | | - ...
	// | - non-inline attachment 1
	// | - non-inline attachment 2
	// | - ...
	//
	// 如果没有内联附件，邮件将是下面的结构
	// + mixed
	// | - body
	// | - non-inline attachment 1
	// | - non-inline attachment 2
	// | - ...
	if m.hasInline {
		// 生成随机边界
		alternative := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))
		related := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))

		// alternative 开始
		buf.WriteString(fmt.Sprintf(
			"Content-Type: multipart/alternative; boundary=%s\r\n", alternative,
		))
		buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", alternative))

		// related 开始
		buf.WriteString(fmt.Sprintf(
			"Content-Type: multipart/related; boundary=%s\r\n", related,
		))
		buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", related))

		writeBody() // 写入正文

		// 写入所有的内联附件
		for _, attachment := range m.Attachments {
			if attachment.Inline {
				buf.WriteString(fmt.Sprintf("\r\n\r\n--%s\r\n", related))
				writeAttachment(attachment)
			}
		}
		// related 结束
		buf.WriteString(fmt.Sprintf("\r\n--%s--", related))

		// alternative 结束
		buf.WriteString(fmt.Sprintf("\r\n--%s--", alternative))
	} else {
		writeBody() // 写入正文
	}
	// 写入所有非内联的附件
	for _, attachment := range m.Attachments {
		if !attachment.Inline {
			buf.WriteString(fmt.Sprintf("\r\n\r\n--%s\r\n", mixed))
			writeAttachment(attachment)
		}
	}
	// mixed 结束
	buf.WriteString(fmt.Sprintf("\r\n--%s--", mixed))

	return buf.Bytes()
}

// 通过 SMTP 协议发送邮件
func (m *Message) Send() error {
	mtas, err := mtas()
	if err != nil {
		return errors.Wrap(err, "查询邮件配置错")
	}
	if len(mtas) == 0 {
		return fmt.Errorf("没有配置 MTA")
	}
	sent := false

	// 逐个使用所有的邮件传输代理，直到遇到第一个可以发送邮件的为止
	for _, mta := range mtas {
		if err := m.SendWithMta(&mta); err != nil {
			xlog.X.Warnf("通过 '%s' 发送邮件错: %v", mta.Name, err)
			continue
		}
		sent = true
		break
	}
	if !sent {
		return fmt.Errorf("尝试了所有 %d 个 MTA, 但是没有一个可以发送邮件", len(mtas))
	}
	return nil
}

// 通过指定代理发送邮件
func (m *Message) SendWithMta(mta *db.MTA) error {
	st := time.Now()

	// 邮件前缀
	m.prefix = mta.Prefix

	// 设置回复地址
	if len(m.ReplyTo) == 0 && len(mta.ReplyTo) > 0 {
		m.ReplyTo = mta.ReplyTo
	}
	// 添加抄送地址
	if len(mta.CC) > 0 {
		arr := strings.Split(mta.CC, ",")
		for _, cc := range arr {
			addr, err := mail.ParseAddress(cc)
			if err != nil {
				return fmt.Errorf("抄送地址 '%s' of '%s' 无效", cc, mta.Name)
			}
			m.Cc = append(m.Cc, addr)
		}
	}
	// 添加密送地址
	if len(mta.BCC) > 0 {
		arr := strings.Split(mta.BCC, ",")
		for _, bcc := range arr {
			addr, err := mail.ParseAddress(bcc)
			if err != nil {
				return fmt.Errorf("密送地址 '%s' of '%s' 无效", bcc, mta.Name)
			}
			m.Bcc = append(m.Bcc, addr)
		}
	}
	// 发送邮件
	if err := m.send(mta); err != nil {
		return err
	}
	xlog.X.Infof("邮件通过 '%s' 发送成功, 耗费 %d 毫秒", mta.Name,
		time.Since(st).Milliseconds(),
	)
	// 更新邮件发送量
	if err := updateSent(mta.UUID); err != nil {
		xlog.X.WithError(err).Warn("更新邮件发送量错")
	}
	return nil
}

// 通过 SMTP 发送邮件
func (m *Message) send(mta *db.MTA) error {
	if len(mta.Host) == 0 {
		return fmt.Errorf("MTA '%s' 的 host 为空", mta.Name)
	}
	if len(mta.Sender) == 0 {
		return fmt.Errorf("MTA '%s' 的 sender 为空", mta.Name)
	}
	from, err := mail.ParseAddress(mta.Sender)
	if err != nil {
		return fmt.Errorf("解析发件人地址 '%s' 错: %v", mta.Sender, err)
	}
	to := addrs2strings(false, m.To, m.Cc, m.Bcc)

	if mta.SSLMode {
		return m.sendWithSSL(mta, from, to)
	}
	var auth smtp.Auth

	if len(mta.Passwd) > 0 {
		if len(mta.Username) > 0 {
			auth = smtp.PlainAuth("", mta.Username, mta.Passwd, mta.Host)
		} else {
			auth = smtp.PlainAuth("", from.Address, mta.Passwd, mta.Host)
		}
	}
	dest := fmt.Sprintf("%s:%d", mta.Host, mta.Port)

	return smtp.SendMail(dest, auth, from.Address, to, m.bytes(from))
}

// need to call tls.Dial instead of smtp.Dial for smtp servers running on 465 that
// require an ssl connection from the very beginning (no starttls)
func (m *Message) sendWithSSL(mta *db.MTA, from *mail.Address, to []string) error {
	dest := fmt.Sprintf("%s:%d", mta.Host, mta.Port)

	conn, err := tls.Dial("tcp", dest, &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         mta.Host,
	})
	if err != nil {
		return err
	}
	defer conn.Close()

	c, err := smtp.NewClient(conn, mta.Host)
	if err != nil {
		return err
	}
	auth := smtp.PlainAuth("", from.Address, mta.Passwd, mta.Host)
	if err = c.Auth(auth); err != nil {
		return err
	}
	// add sender and recipients
	if err = c.Mail(from.Address); err != nil {
		return err
	}
	for _, r := range to {
		if err = c.Rcpt(r); err != nil {
			return err
		}
	}
	// write message body
	w, err := c.Data()
	if err != nil {
		return err
	}
	if _, err = w.Write(m.bytes(from)); err != nil {
		return err
	}
	if err = w.Close(); err != nil {
		return err
	}
	return c.Quit()
}

func newMessage(subject string, body string, bodyType string) *Message {
	return &Message{
		Subject:     subject,
		BodyType:    bodyType,
		Body:        body,
		Attachments: make(map[string]*Attachment),
	}
}

// TextMessage returns a new Message that can compose an email with attachments
func TextMessage(subject string, body string) *Message {
	return newMessage(subject, body, "text/plain")
}

// HTMLMessage returns a new Message that can compose an HTML email with attachments
func HTMLMessage(subject string, body string) *Message {
	return newMessage(subject, body, "text/html")
}

// addrs2strings convert mail.Address array to string array
//   with name: Name <mail@addr.com>
//   with no name: mail@addr.com
func addrs2strings(withName bool, args ...[]*mail.Address) []string {
	var list []string

	for _, arg := range args {
		for _, a := range arg {
			if withName {
				list = append(list, a.String())
			} else {
				list = append(list, a.Address)
			}
		}
	}
	return list
}
