package secure

import (
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

var BcryptPHC = &PHC{
	Id: IdBcrypt,
	Params: map[string]interface{}{
		"r": 10, // rounds
	},
}

const bcryptMaxPasswordLen = 64

// Bcrypt hash
func bcryptHash(p *PHC, password string) error {
	if p == nil || p.Params == nil {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > bcryptMaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}
	rounds := 10

	if r, err := p.intParam("r"); err != nil {
		xlog.X.WithError(err).Warn("No round param give to bcrypt hash")
	} else {
		rounds = r
	}
	value, err := bcrypt.GenerateFromPassword([]byte(password), rounds)
	if err != nil {
		return err
	}
	p.Params["r"] = rounds
	p.Value = base64.RawStdEncoding.EncodeToString(value)
	return nil
}

// Verify bcrypt hash
func bcryptVerify(p *PHC, password string) error {
	if p == nil || p.Params == nil || len(p.Value) == 0 {
		return fmt.Errorf("parameters invalid")
	}
	if len(password) == 0 || len(password) > bcryptMaxPasswordLen {
		return fmt.Errorf("input password invalid")
	}
	value, err := base64.RawStdEncoding.Strict().DecodeString(p.Value)
	if err != nil {
		return err
	}
	err = bcrypt.CompareHashAndPassword(value, []byte(password))
	if err != nil {
		return err
	}
	return nil
}
