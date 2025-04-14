package shortener

import "regexp"

// isValidCustomSlug checks if a custom slug meets all requirements
func isValidCustomSlug(slug string) bool {
	// Length check (1-100 characters)
	if len(slug) < 1 || len(slug) > 100 {
		return false
	}

	// Regex pattern: allow alphanumeric, hyphens, and underscores
	// Must start and end with an alphanumeric character
	pattern := regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$`)
	return pattern.MatchString(slug)
}
