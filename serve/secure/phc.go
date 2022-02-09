package secure

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/lucky-byte/reactgo/serve/xlog"
)

const (
	IdArgon2id = "argon2id"
	IdBcrypt   = "bcrypt"
	IdPBKDF2   = "pbkdf2"
)

// Password Hashing Competition
type PHC struct {
	Id      string
	Version int
	Params  map[string]interface{}
	Salt    string
	Value   string
}

var defaultPHC *PHC

func init() {
	defaultPHC = Argon2idPHC
}

func SetDefaultPHC(id string) {
	if strings.EqualFold(id, IdArgon2id) {
		defaultPHC = Argon2idPHC
		return
	}
	if strings.EqualFold(id, IdBcrypt) {
		defaultPHC = BcryptPHC
		return
	}
	if strings.EqualFold(id, IdPBKDF2) {
		defaultPHC = PBKDF2PHC
		return
	}
	xlog.X.Panicf("PHC id '%s' unrecognizabled", id)
}

func DefaultPHC() *PHC {
	return defaultPHC
}

func IsIdSupported(id string) bool {
	return strings.EqualFold(id, IdArgon2id) ||
		strings.EqualFold(id, IdBcrypt) || strings.EqualFold(id, IdPBKDF2)
}

// parse PHC string
// https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
func ParsePHC(s string) (*PHC, error) {
	p := new(PHC)
	p.Params = make(map[string]interface{})

	fields := strings.Split(s, "$")
	if len(fields) != 6 {
		return nil, fmt.Errorf("phc string '%s' incomplete", s)
	}
	fields = fields[1:]

	// Id
	if !IsIdSupported(fields[0]) {
		return nil, fmt.Errorf("unrecognizabled hash algorithm '%s'", fields[0])
	}
	p.Id = fields[0]

	// Version
	if strings.HasPrefix(fields[1], "v=") && len(fields[1]) > 2 {
		version, err := strconv.Atoi(fields[1][2:])
		if err != nil {
			return nil, fmt.Errorf("phc version '%s' is invalid, %v", fields[1], err)
		}
		p.Version = version
	} else {
		return nil, fmt.Errorf("phc version is missing")
	}

	// Params
	if len(fields[2]) > 0 {
		params := strings.Split(fields[2], ",")
		for _, v := range params {
			pair := strings.Split(v, "=")
			if len(pair) != 2 {
				return nil, fmt.Errorf("phc params '%s' incorrect", fields[2])
			}
			p.Params[pair[0]] = pair[1]
		}
	}

	// Salt and hash
	p.Salt = fields[3]
	p.Value = fields[4]

	return p, nil
}

func (p *PHC) String() string {
	var params []string

	for k := range p.Params {
		if v, err := p.stringParam(k); err != nil {
			xlog.X.WithError(err).Errorf("convert phc param failed")
		} else {
			params = append(params, k+"="+v)
		}
	}
	return fmt.Sprintf("$%s$v=%d$%s$%s$%s",
		strings.ToLower(p.Id), p.Version, strings.Join(params, ","), p.Salt, p.Value,
	)
}

// Hash password
func (p *PHC) Hash(password string) (string, error) {
	if strings.EqualFold(p.Id, IdArgon2id) {
		if err := argon2idHash(p, password); err != nil {
			return "", err
		}
		return p.String(), nil
	}
	if strings.EqualFold(p.Id, IdBcrypt) {
		if err := bcryptHash(p, password); err != nil {
			return "", err
		}
		return p.String(), nil
	}
	if strings.EqualFold(p.Id, IdPBKDF2) {
		if err := pbkdf2Hash(p, password); err != nil {
			return "", err
		}
		return p.String(), nil
	}
	return "", fmt.Errorf("hash algorithm '%s' invalid", p.Id)
}

// Verify password
func (p *PHC) Verify(password string) error {
	if strings.EqualFold(p.Id, IdArgon2id) {
		return argon2idVerify(p, password)
	}
	if strings.EqualFold(p.Id, IdBcrypt) {
		return bcryptVerify(p, password)
	}
	if strings.EqualFold(p.Id, IdPBKDF2) {
		return pbkdf2Verify(p, password)
	}
	return fmt.Errorf("hash algorithm '%s' invalid", p.Id)
}

// Extract param value as string
func (p *PHC) stringParam(k string) (string, error) {
	if p.Params == nil || p.Params[k] == nil {
		return "", fmt.Errorf("no param named '%s'", k)
	}
	switch v2 := p.Params[k].(type) {
	case string:
		return v2, nil
	case int:
		return strconv.Itoa(v2), nil
	default:
		return "", fmt.Errorf("phc param type(%T) not support yet", p.Params[k])
	}
}

// Extract param value as int
func (p *PHC) intParam(k string) (int, error) {
	if p.Params == nil || p.Params[k] == nil {
		return 0, fmt.Errorf("no param named '%s'", k)
	}
	switch v2 := p.Params[k].(type) {
	case string:
		return strconv.Atoi(v2)
	case int:
		return v2, nil
	default:
		return 0, fmt.Errorf("phc param type(%T) not support yet", p.Params[k])
	}
}
