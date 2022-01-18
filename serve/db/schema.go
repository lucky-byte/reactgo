package db

import (
	"fmt"
	"regexp"

	"github.com/lucky-byte/bdb/serve/xlog"
)

// Schema pattern
var schemaPattern = regexp.MustCompile(`^kiam(_[0-9a-zA-Z]{20})?$`)

type Schema string

// Validate schema name
func (s Schema) IsValid() bool {
	if len(s) < 4 || len(s) > 64 {
		return false
	}
	return schemaPattern.MatchString(string(s))
}

// Insert schema into sql statement with fmt.Sprintf()
func (s Schema) Q(q string) string {
	if len(s) < 4 || len(s) > 64 {
		xlog.X.Panicf("'%s' is not a valid schema name", s)
	}
	if !schemaPattern.MatchString(string(s)) {
		xlog.X.Panicf("'%s' is not a valid schema name", s)
	}
	ql := fmt.Sprintf(q, s)
	return ql
}
