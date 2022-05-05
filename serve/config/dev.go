//go:build dev

package config

// -tag dev 编译时将 dev 设置为 true
func init() {
	dev = true
}
