package jwt2

import (
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pkg/errors"

	"github.com/lucky-byte/reactgo/serve/db"
	"github.com/lucky-byte/reactgo/serve/secure"
)

type AuthJWT struct {
	jwt.RegisteredClaims
	User     string
	Activate bool
}

// 生成 JWT
func JWTGenerate(j *AuthJWT) (string, error) {
	keys, err := getSignKeyPair()
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, j)
	return token.SignedString([]byte(keys.NewKey))
}

// 解析 JWT
func JWTParse(tokenStr string) (*AuthJWT, error) {
	keys, err := getSignKeyPair()
	if err != nil {
		return nil, err
	}
	newKeyFunc := func(token *jwt.Token) (any, error) {
		return []byte(keys.NewKey), nil
	}
	oldKeyFunc := func(token *jwt.Token) (any, error) {
		return []byte(keys.OldKey), nil
	}
	var token *jwt.Token

	// 使用新密钥计算签名
	token, err = jwt.ParseWithClaims(tokenStr, &AuthJWT{}, newKeyFunc)
	if err != nil {
		if keys.NewKey == keys.OldKey {
			return nil, err
		}
		// 使用旧密钥计算签名
		token, err = jwt.ParseWithClaims(tokenStr, &AuthJWT{}, oldKeyFunc)
		if err != nil {
			return nil, err
		}
	}
	JWT, ok := token.Claims.(*AuthJWT)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("登录 JWT 凭证无效")
	}
	return JWT, nil
}

func NewAuthJWT(user string, activate bool, duration time.Duration) *AuthJWT {
	return &AuthJWT{
		jwt.RegisteredClaims{
			Issuer:    "LUCKYBYTE",
			IssuedAt:  &jwt.NumericDate{Time: time.Now()},
			ExpiresAt: &jwt.NumericDate{Time: time.Now().Add(duration)},
		},
		user,
		activate,
	}
}

type keypair struct {
	NewKey string `db:"jwtsignkey"`
	OldKey string `db:"jwtsignkey2"`
}

// 从数据库获取签名密钥
func getSignKeyPair() (*keypair, error) {
	ql := `select jwtsignkey, jwtsignkey2 from account`
	var keys keypair

	if err := db.SelectOne(ql, &keys); err != nil {
		return nil, errors.Wrap(err, "查询 Jwt 签名密钥错")
	}
	// 如果还没有设置签名密钥，这自动设置为一个随机数
	if len(keys.NewKey) == 0 {
		k, err := secure.RandomBytes(16)
		if err != nil {
			return nil, errors.Wrap(err, "生成安全随机数错")
		}
		key := hex.EncodeToString(k)

		ql = `update account set jwtsignkey = ?, jwtsignkey2 = ?`

		if err = db.ExecOne(ql, key, key); err != nil {
			return nil, errors.Wrap(err, "更新安全随机数错")
		}
		keys.NewKey = key
		keys.OldKey = key
	}
	return &keys, nil
}
