package secure

import (
	"crypto/rand"
	"io"
)

// RandomBytes generate secure random bytes
func RandomBytes(len uint32) ([]byte, error) {
	bytes := make([]byte, len)
	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return nil, err
	}
	return bytes, nil
}
