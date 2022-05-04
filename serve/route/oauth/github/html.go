package github

import (
	"bytes"
	_ "embed"
	"fmt"
	"html/template"
)

//go:embed error.html
var _errorHtml string

//go:embed success.html
var _successHtml string

// 授权失败网页
func buildErrorHtml(reason string) string {
	var o bytes.Buffer

	t, err := template.New("error").Parse(_errorHtml)
	if err != nil {
		return fmt.Sprintf("解析模版错误: %v", err)
	}
	err = t.Execute(&o, map[string]string{"reason": reason})
	if err != nil {
		return fmt.Sprintf("执行模版错误: %v", err)
	}
	return o.String()
}

// 授权成功网页
func buildSuccessHtml(identity string) string {
	var o bytes.Buffer

	t, err := template.New("error").Parse(_successHtml)
	if err != nil {
		return fmt.Sprintf("解析模版错误: %v", err)
	}
	err = t.Execute(&o, map[string]string{"identity": identity})
	if err != nil {
		return fmt.Sprintf("执行模版错误: %v", err)
	}
	return o.String()
}
