package secure

import (
	"crypto/subtle"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/argon2"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

var Argon2idPHC = &PHC{
	Id: IdArgon2id,
	Params: map[string]interface{}{
		"m": 65536, // memory, 64M
		"t": 3,     // iterations
		"p": 2,     // parallelism
	},
}

const (
	argon2idSaltLength     = 16
	argon2idKeyLength      = 32
	argon2idMaxPasswordLen = 64
)

// internal
type argon2idConfig struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
}

// Argon2id hash
func argon2idHash(p *PHC, password string) error {
	if p == nil || p.Params == nil {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > argon2idMaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}

	// Version
	if p.Version > 0 {
		if p.Version != argon2.Version {
			return fmt.Errorf("given argon2 version '%d' unsupported", p.Version)
		}
	}
	p.Version = argon2.Version

	c, err := params2argon2idConfig(p)
	if err != nil {
		xlog.X.WithError(err).Warn("No param give to argon2id hash")
		c = &argon2idConfig{65536, 3, 2}
	}

	// Generate a cryptographically secure random salt.
	salt, err := RandomBytes(argon2idSaltLength)
	if err != nil {
		return err
	}
	// This will generate a value of the password using the Argon2id variant.
	value := argon2.IDKey(
		[]byte(password), salt, c.iterations, c.memory, c.parallelism, argon2idKeyLength,
	)

	// Base64 encode the salt and hashed password.
	p.Salt = base64.RawStdEncoding.EncodeToString(salt)
	p.Value = base64.RawStdEncoding.EncodeToString(value)
	return nil
}

// Verify argon2id hash
func argon2idVerify(p *PHC, password string) error {
	if p == nil || p.Params == nil || len(p.Salt) == 0 || len(p.Value) == 0 {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > argon2idMaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}

	c, err := params2argon2idConfig(p)
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
	// Derive the key from the other password using the same parameters.
	verify := argon2.IDKey(
		[]byte(password), salt, c.iterations, c.memory, c.parallelism, argon2idKeyLength,
	)
	// Check that the contents of the hashed passwords are identical. Note
	// that we are using the subtle.ConstantTimeCompare() function for this
	// to help prevent timing attacks.
	if subtle.ConstantTimeCompare(verify, value) == 0 {
		return fmt.Errorf("argon2id password dismatch")
	}
	return nil
}

func params2argon2idConfig(p *PHC) (*argon2idConfig, error) {
	c := new(argon2idConfig)

	m, err := p.intParam("m")
	if err != nil {
		return nil, err
	}
	c.memory = uint32(m)

	t, err := p.intParam("t")
	if err != nil {
		return nil, err
	}
	c.iterations = uint32(t)

	p2, err := p.intParam("p")
	if err != nil {
		return nil, err
	}
	c.parallelism = uint8(p2)

	return c, nil
}
