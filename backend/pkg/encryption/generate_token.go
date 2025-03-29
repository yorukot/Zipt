package encryption

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateTokenHex generates a random hex string of the specified length (in bytes)
// The returned string will be twice the length of the input bytes due to hex encoding
func GenerateTokenHex(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return hex.EncodeToString(b)
}
