package queries

import (
	"fmt"
	"strings"
	"time"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
	"gorm.io/gorm"
)

// IncrementURLReferrerCount increments the click count for a specific URL referrer by 1
func IncrementURLReferrerCount(urlID uint64, referrer string) error {
	database := db.GetDB()
	referrer = strings.TrimSpace(referrer)

	// Sanitize empty referrer
	if referrer == "" {
		referrer = "direct"
	}

	// Try to find an existing record
	var urlReferrer models.URLReferrer
	result := database.Where("url_id = ? AND referrer = ?", urlID, referrer).First(&urlReferrer)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create a new record if none exists
			urlReferrer = models.URLReferrer{
				URLID:      urlID,
				Referrer:   referrer,
				ClickCount: 1,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if err := database.Create(&urlReferrer).Error; err != nil {
				logger.Log.Error(fmt.Sprintf("Failed to create URL referrer record: %v", err))
				return err
			}
			return nil
		}
		logger.Log.Error(fmt.Sprintf("Error finding URL referrer: %v", result.Error))
		return result.Error
	}

	// Increment the click count
	urlReferrer.ClickCount++
	urlReferrer.UpdatedAt = time.Now()

	if err := database.Save(&urlReferrer).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL referrer: %v", err))
		return err
	}

	return nil
}

// IncrementURLAnalyticsCount increments the click count for a URL's analytics by 1
func IncrementURLAnalyticsCount(urlID uint64) error {
	database := db.GetDB()

	// Try to find an existing record
	var urlAnalytics models.URLAnalytics
	result := database.Where("url_id = ?", urlID).First(&urlAnalytics)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create a new record if none exists
			urlAnalytics = models.URLAnalytics{
				URLID:      urlID,
				ClickCount: 1,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if err := database.Create(&urlAnalytics).Error; err != nil {
				logger.Log.Error(fmt.Sprintf("Failed to create URL analytics record: %v", err))
				return err
			}
			return nil
		}
		logger.Log.Error(fmt.Sprintf("Error finding URL analytics: %v", result.Error))
		return result.Error
	}

	// Increment the click count
	urlAnalytics.ClickCount++
	urlAnalytics.UpdatedAt = time.Now()

	if err := database.Save(&urlAnalytics).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL analytics: %v", err))
		return err
	}

	return nil
}

// TrackURLEngagement adds engagement for the current hour
func TrackURLEngagement(urlID uint64) error {
	database := db.GetDB()

	// Get current time and round to the nearest hour
	now := time.Now()
	hourStart := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), 0, 0, 0, now.Location())
	hourEnd := hourStart.Add(time.Hour)

	// Try to find an existing record for this hour
	var urlEngagement models.URLEngagement
	result := database.Where("url_id = ? AND time_start = ?", urlID, hourStart).First(&urlEngagement)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create a new record if none exists for this hour
			urlEngagement = models.URLEngagement{
				URLID:      urlID,
				Engagement: 1,
				TimeStart:  hourStart,
				TimeEnd:    hourEnd,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			if err := database.Create(&urlEngagement).Error; err != nil {
				logger.Log.Error(fmt.Sprintf("Failed to create URL engagement record: %v", err))
				return err
			}
			return nil
		}
		logger.Log.Error(fmt.Sprintf("Error finding URL engagement: %v", result.Error))
		return result.Error
	}

	// Increment the engagement
	urlEngagement.Engagement++
	urlEngagement.UpdatedAt = now

	if err := database.Save(&urlEngagement).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL engagement: %v", err))
		return err
	}

	return nil
}

// TrackURLCountryAnalytics increments the click count for a specific country for a URL
func TrackURLCountryAnalytics(urlID uint64, country string) error {
	database := db.GetDB()

	// Sanitize empty country or invalid codes
	if country == "" || len(country) > 2 {
		country = "XX" // Use XX for unknown country
	}

	// Ensure country code is uppercase
	country = strings.ToUpper(country)

	// Try to find an existing record
	var urlCountryAnalytics models.URLCountryAnalytics
	result := database.Where("url_id = ? AND country = ?", urlID, country).First(&urlCountryAnalytics)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create a new record if none exists
			urlCountryAnalytics = models.URLCountryAnalytics{
				URLID:      urlID,
				Country:    country,
				ClickCount: 1,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if err := database.Create(&urlCountryAnalytics).Error; err != nil {
				logger.Log.Error(fmt.Sprintf("Failed to create URL country analytics record: %v", err))
				return err
			}
			return nil
		}
		logger.Log.Error(fmt.Sprintf("Error finding URL country analytics: %v", result.Error))
		return result.Error
	}

	// Increment the click count
	urlCountryAnalytics.ClickCount++
	urlCountryAnalytics.UpdatedAt = time.Now()

	if err := database.Save(&urlCountryAnalytics).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL country analytics: %v", err))
		return err
	}

	return nil
}

// TrackAllAnalytics is a convenience function to update all analytics at once
func TrackAllAnalytics(urlID uint64, referrer string, country string) error {
	if err := IncrementURLReferrerCount(urlID, referrer); err != nil {
		return err
	}

	if err := IncrementURLAnalyticsCount(urlID); err != nil {
		return err
	}

	if err := TrackURLEngagement(urlID); err != nil {
		return err
	}

	if err := TrackURLCountryAnalytics(urlID, country); err != nil {
		return err
	}

	return nil
}