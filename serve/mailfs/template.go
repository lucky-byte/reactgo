package mailfs

import (
	"bytes"
	"html/template"
	"strings"

	"github.com/google/uuid"

	"github.com/lucky-byte/reactgo/serve/email"
)

func Message(subject, name string, data map[string]interface{}) (*email.Message, error) {
	html, err := ReadHtml(name)
	if err != nil {
		return nil, err
	}
	logo, err := ReadLogo()
	if err != nil {
		return nil, err
	}
	logo_cid := strings.ReplaceAll(uuid.NewString(), "-", "")
	logo_url := template.URL("cid:" + logo_cid)

	if data == nil {
		data = map[string]interface{}{
			"Logo":  logo_url,
			"Title": subject,
		}
	} else {
		data["Logo"] = logo_url
		data["Title"] = subject
	}
	// parse template
	t, err := template.New("mail").Parse(string(html))
	if err != nil {
		return nil, err
	}
	var o bytes.Buffer

	if err = t.Execute(&o, data); err != nil {
		return nil, err
	}
	m := email.HTMLMessage(subject, o.String())

	m.AttachBuffer("logo.png", logo, true, logo_cid)

	return m, nil
}
