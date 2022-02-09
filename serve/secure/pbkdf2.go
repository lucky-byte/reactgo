package secure

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"hash"

	"golang.org/x/crypto/pbkdf2"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

var PBKDF2PHC = &PHC{
	Id: IdPBKDF2,
	Params: map[string]interface{}{
		"t": 310_000,  // iterations
		"h": "sha256", // hash function
	},
}

const (
	pbkdf2SaltLength     = 16
	pbkdf2KeyLength      = 32
	pbkdf2MaxPasswordLen = 64
)

// internal
type pbkdf2Config struct {
	iterations int
	hash       string
}

// PBKDF2 hash
func pbkdf2Hash(p *PHC, password string) error {
	if p == nil || p.Params == nil {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > pbkdf2MaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}
	c, err := params2pbkdf2Config(p)
	if err != nil {
		xlog.X.WithError(err).Warn("No param give to pbkdf2 hash")
		c = &pbkdf2Config{310_000, "sha256"}
	}

	salt, err := RandomBytes(pbkdf2SaltLength)
	if err != nil {
		return err
	}
	h := hashFunc(c.hash)
	value := pbkdf2.Key([]byte(password), salt, c.iterations, pbkdf2KeyLength, h)

	p.Salt = base64.RawStdEncoding.EncodeToString(salt)
	p.Value = base64.RawStdEncoding.EncodeToString(value)

	return nil
}

// Verify PBKDF2 hash
func pbkdf2Verify(p *PHC, password string) error {
	if p == nil || p.Params == nil || len(p.Salt) == 0 || len(p.Value) == 0 {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > pbkdf2MaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}

	c, err := params2pbkdf2Config(p)
	if err != nil {
		return err
	}

	salt, err := base64.RawStdEncoding.Strict().DecodeString(p.Salt)
	if err != nil {
		return err
	}
	value, err := base64.RawStdEncoding.Strict().DecodeString(p.Value)
	if err != nil {
		return err
	}
	h := hashFunc(c.hash)
	verify := pbkdf2.Key([]byte(password), salt, c.iterations, pbkdf2KeyLength, h)

	if subtle.ConstantTimeCompare(value, verify) == 0 {
		return fmt.Errorf("pbkdf2 password dismatch")
	}
	return nil
}

func params2pbkdf2Config(p *PHC) (*pbkdf2Config, error) {
	c := new(pbkdf2Config)

	t, err := p.intParam("t")
	if err != nil {
		return nil, err
	}
	c.iterations = t

	h, err := p.stringParam("h")
	if err != nil {
		return nil, err
	}
	c.hash = h

	return c, nil
}

func hashFunc(h string) func() hash.Hash {
	switch h {
	case "sha1":
		return sha1.New
	case "sha224":
		return sha256.New224
	case "sha256":
		return sha256.New
	case "sha284":
		return sha512.New384
	case "sha512":
		return sha512.New
	default:
		return nil
	}
}
