package shortener

import (
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// RedirectURL handles redirecting a user to the original URL
func RedirectURL(c *gin.Context) {
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Get the URL from the database
	url, result := queries.GetURLQueueByShortCode(shortCode)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Check if the URL has expired
	if url.ExpiresAt != nil && url.ExpiresAt.Before(time.Now()) {
		utils.FullyResponse(c, http.StatusGone, "Short URL has expired", utils.ErrResourceGone, nil)
		return
	}

	// Track analytics (async to not delay redirect)
	go trackURLAnalytics(c, url.ID)

	// Redirect to the original URL
	c.Redirect(http.StatusMovedPermanently, url.OriginalURL)
}

// trackURLAnalytics records analytics data for a URL click
func trackURLAnalytics(c *gin.Context, urlID uint64) {
	// Get referrer
	referrer := c.Request.Referer()

	// Sanitize the referrer URL by removing query parameters and fragments
	if referrer != "" {
		referrer = sanitizeReferrer(referrer)
	} else {
		referrer = "direct"
	}

	// Get country from Cloudflare header
	country := c.Request.Header.Get("CF-IPCountry")

	// Track analytics with URL ID, referrer, and country
	err := queries.TrackAllAnalytics(urlID, referrer, country)

	if err != nil {
		// Just log the error but don't affect the user experience
		c.Error(err)
	}

	// TODO: Implement more detailed analytics tracking in the future
	// We're collecting the following data points for future use:
	// - User agent info (browser, version, device type, OS)
	// - Geographic info (country, city, region)
}

// sanitizeReferrer removes query parameters and fragments from URLs
// to protect privacy and provide cleaner analytics data
func sanitizeReferrer(referrer string) string {
	// Parse the URL
	parsedURL, err := url.Parse(referrer)
	if err != nil {
		// If parsing fails, just return the original but truncated
		if len(referrer) > 255 {
			return referrer[:255]
		}
		return referrer
	}

	// Remove query parameters and fragments
	parsedURL.RawQuery = ""
	parsedURL.Fragment = ""

	// Return just the scheme, host, and path
	cleanReferrer := parsedURL.String()

	// Ensure it's not too long for the database
	if len(cleanReferrer) > 255 {
		return cleanReferrer[:255]
	}

	return cleanReferrer
}