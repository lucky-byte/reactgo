package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

const signKey = "005c62681e39b25c3f84f699ab0b795e"

type AuthJWT struct {
	jwt.RegisteredClaims
	User     string
	Activate bool
}

// generate json web token
func JWTGenerate(j *AuthJWT) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, j)
	return token.SignedString([]byte(signKey))
}

// parse json web token
func JWTParse(tokenStr string) (*AuthJWT, error) {
	jwtKeyFunc := func(token *jwt.Token) (interface{}, error) {
		return []byte(signKey), nil
	}
	token, err := jwt.ParseWithClaims(tokenStr, &AuthJWT{}, jwtKeyFunc)
	if err != nil {
		return nil, err
	}
	JWT, ok := token.Claims.(*AuthJWT)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("登录 TOKEN 无效")
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
