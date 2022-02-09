package secure

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"

	"github.com/pkg/errors"
)

// RSA-SHA256 签名
// s 是签名数据, pemkey 是 PEM 格式的私钥, 返回 base64 的签名或者错误
func RSASHA256(s []byte, pemkey string) (string, error) {
	block, _ := pem.Decode([]byte(pemkey))
	if block == nil {
		return "", fmt.Errorf("RSASHA256: 读取 PEM KEY 错")
	}
	pkey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return "", errors.Wrap(err, "读取签名 KEY 错")
	}
	hash := sha256.New()

	_, err = hash.Write(s)
	if err != nil {
		return "", errors.Wrap(err, "SHA256 HASH 错")
	}
	sum := hash.Sum(nil)

	sign, err := rsa.SignPKCS1v15(rand.Reader, pkey, crypto.SHA256, sum)
	if err != nil {
		return "", errors.Wrap(err, "签名错")
	}
	return base64.StdEncoding.EncodeToString(sign), nil
}
