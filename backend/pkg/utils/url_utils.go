package utils

import (
	"os"
	"strings"
)

// GetDefaultShortDomain returns the default domain for short URLs
func GetDefaultShortDomain() string {
	shortDomain := os.Getenv("SHORT_DOMAIN")
	if shortDomain == "" {
		return "localhost:8080" // Default for local development
	}
	return shortDomain
}

// NormalizeDomainName removes protocol prefixes from domain names
// and returns the cleaned domain name and whether HTTPS was specified
func NormalizeDomainName(domainName string) (string, bool) {
	isHTTPS := strings.HasPrefix(domainName, "https://")

	// Remove any protocol prefixes
	domainName = strings.TrimPrefix(domainName, "https://")
	domainName = strings.TrimPrefix(domainName, "http://")

	// Remove trailing slashes if present
	domainName = strings.TrimRight(domainName, "/")

	return domainName, isHTTPS
}

// BuildShortURL constructs a short URL with the appropriate protocol
func BuildShortURL(domainName string, isHTTPS bool, shortCode string) string {
	protocol := "http://"
	if isHTTPS {
		protocol = "https://"
	}

	return protocol + domainName + "/" + shortCode
}

// GetFullShortURL builds the complete short URL from domain and short code
func GetFullShortURL(domainName string, shortCode string) string {
	// Handle custom domain if provided
	if domainName != "" {
		normalizedDomain, isHTTPS := NormalizeDomainName(domainName)
		return BuildShortURL(normalizedDomain, isHTTPS, shortCode)
	}

	// For default domain
	shortDomain := GetDefaultShortDomain()
	normalizedDomain, isHTTPS := NormalizeDomainName(shortDomain)
	return BuildShortURL(normalizedDomain, isHTTPS, shortCode)
}
