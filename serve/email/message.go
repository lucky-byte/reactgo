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
	"github.com/lucky-byte/bdb/serve/db"
	"github.com/lucky-byte/bdb/serve/xlog"
	"github.com/pkg/errors"
)

// Attachment represents an email attachment.
type Attachment struct {
	Filename  string // filename
	Data      []byte // attachment data
	Inline    bool   // is inline
	ContentId string // content id
}

// Header represents an additional email header.
type Header struct {
	Key   string
	Value string
}

// Message represents a smtp message.
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

// AddTO add a recipient
func (m *Message) AddTO(address *mail.Address) []*mail.Address {
	m.To = append(m.To, address)
	return m.To
}

// AddCC add a cc recipient
func (m *Message) AddCC(address *mail.Address) []*mail.Address {
	m.Cc = append(m.Cc, address)
	return m.Cc
}

// AddBCC add a bcc recipient
func (m *Message) AddBCC(address *mail.Address) []*mail.Address {
	m.Bcc = append(m.Bcc, address)
	return m.Bcc
}

// AttachBuffer attaches a binary attachment.
func (m *Message) AttachBuffer(filename string, buf []byte, inline bool) error {
	m.Attachments[filename] = &Attachment{
		Filename: filename,
		Data:     buf,
		Inline:   inline,
	}
	return nil
}

// Attach attaches a file.
func (m *Message) Attach(file string) error {
	return m.attach(file, false, "")
}

// Inline includes a file as an inline attachment.
func (m *Message) Inline(file string, cid string) error {
	return m.attach(file, true, cid)
}

// AddHeader a Header to message
func (m *Message) AddHeader(key string, value string) Header {
	newHeader := Header{Key: key, Value: value}
	m.Headers = append(m.Headers, newHeader)
	return newHeader
}

// bytes returns the mail data
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

	// add custom headers
	if len(m.Headers) > 0 {
		for _, header := range m.Headers {
			buf.WriteString(fmt.Sprintf("%s: %s\r\n", header.Key, header.Value))
		}
	}
	// write message body
	writeBody := func() {
		buf.WriteString(fmt.Sprintf(
			"Content-Type: %s; charset=utf-8\r\n\r\n", m.BodyType,
		))
		buf.WriteString(m.Body)
		buf.WriteString("\r\n")
	}
	// no attachment, write the body and return
	if len(m.Attachments) == 0 {
		writeBody()
		return buf.Bytes()
	}
	// write attachment
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

		// inline attachment give a content id so body can ref to it by cid:
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

		// write base64 content in lines of up to 76 chars
		for i, l := 0, len(b); i < l; i++ {
			buf.WriteByte(b[i])
			if (i+1)%76 == 0 {
				buf.WriteString("\r\n")
			}
		}
	}
	// generate a random mixed boundary
	mixed := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))

	// mixed begin
	buf.WriteString(fmt.Sprintf(
		"Content-Type: multipart/mixed; boundary=%s\r\n", mixed,
	))
	buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", mixed))

	// if has inline attachment, the email will become below structure
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
	// if no inline attachment, the email will be below structure
	// + mixed
	// | - body
	// | - non-inline attachment 1
	// | - non-inline attachment 2
	// | - ...
	if m.hasInline {
		// random generated boundary
		alternative := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))
		related := strings.ToLower(strings.ReplaceAll(uuid.NewString(), "-", ""))

		// alternative begin
		buf.WriteString(fmt.Sprintf(
			"Content-Type: multipart/alternative; boundary=%s\r\n", alternative,
		))
		buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", alternative))

		// related begin
		buf.WriteString(fmt.Sprintf(
			"Content-Type: multipart/related; boundary=%s\r\n", related,
		))
		buf.WriteString(fmt.Sprintf("\r\n--%s\r\n", related))

		writeBody() // write body

		// write all inline attachments
		for _, attachment := range m.Attachments {
			if attachment.Inline {
				buf.WriteString(fmt.Sprintf("\r\n\r\n--%s\r\n", related))
				writeAttachment(attachment)
			}
		}
		// related end
		buf.WriteString(fmt.Sprintf("\r\n--%s--", related))

		// alternative end
		buf.WriteString(fmt.Sprintf("\r\n--%s--", alternative))
	} else {
		writeBody() // write body
	}
	// write all non-inline attachments
	for _, attachment := range m.Attachments {
		if !attachment.Inline {
			buf.WriteString(fmt.Sprintf("\r\n\r\n--%s\r\n", mixed))
			writeAttachment(attachment)
		}
	}
	// mixed end
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

	// try all of mtas one by one, until meet one which can send the mail
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

// send with smtp
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

	if mta.SSL {
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
