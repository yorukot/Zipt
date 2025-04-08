package shortener

import (
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mileusna/useragent"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/geoip"
	"github.com/yorukot/zipt/pkg/logger"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// RedirectURL handles redirecting a user to the original URL
func RedirectURL(c *gin.Context) {
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Check if we're on a custom domain
	host := c.Request.Host
	domainID := uint64(0) // Default to no domain

	// If not on default domain, check if custom domain is registered
	if host != utils.GetDefaultShortDomain() {
		domain, result := queries.GetDomainByName(host)
		if result.Error == nil && domain.Verified {
			// Use this domain's ID for the URL lookup
			domainID = domain.ID
		}
		if result.Error == nil && !domain.Verified {
			utils.FullyResponse(c, http.StatusBadRequest, "Domain not verified", utils.ErrBadRequest, nil)
			return
		}
	}

	// Get the URL from the database
	var url models.URL
	var result *gorm.DB

	if domainID > 0 {
		// For custom domains, get URL specific to this domain
		url, result = queries.GetURLByShortCodeAndDomain(shortCode, domainID)
	} else {
		// For the default domain
		url, result = queries.GetURLQueueByShortCode(shortCode)
	}

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

	// Get the IP address of the client
	// ipAddress := c.ClientIP()

	// Look up geolocation
	country, city := geoip.Lookup("114.38.215.119")

	if country == "" {
		country = "Unknow"
	}

	if city == "" {
		city = "Unknown"
	}

	// Get device information
	device, browser, os := getDevice(c)

	// Track analytics with URL ID, referrer, country and city
	result := queries.TrackAllAnalytics(models.URLAnalytics{
		URLID:      urlID,
		Referrer:   referrer,
		Country:    country,
		City:       city,
		Device:     device,
		Browser:    browser,
		OS:         os,
	})

	if result != nil && result.Error != nil {
		// Just log the error but don't affect the user experience
		logger.Log.Sugar().Errorf("Failed to track analytics: %v", result.Error)
	}
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

// getDevice returns the device, browser, and OS from the user agent
func getDevice(c *gin.Context) (device string, browser string, os string) {
	origin := c.Request.UserAgent()
	ua := useragent.Parse(origin)
	browser = ua.Name
	os = ua.OS
	device = ua.Device
	if device == "" {
		device = "Unknown"
	}

	if browser == "" {
		browser = "Unknown"
	}

	if os == "" {
		os = "Unknown"
	}

	return device, browser, os
}