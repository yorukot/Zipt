package queries

import (
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
)

// ================================
// For the add or update analytics data to the database
// ================================
func TrackAllAnalytics(tracker models.URLAnalytics) *gorm.DB {
	// Round the current time to the nearest 2-minute bucket for consistent grouping
	now := time.Now()
	bucketTime := now.Truncate(2 * time.Minute)

	analytics := models.URLAnalytics{
		URLID:      tracker.URLID,
		Referrer:   tracker.Referrer,
		Country:    tracker.Country,
		City:       tracker.City,
		Device:     tracker.Device,
		Browser:    tracker.Browser,
		OS:         tracker.OS,
		ClickCount: 1,
		BucketTime: bucketTime,
	}

	// First check if the analytics record already exists
	var existingAnalytics models.URLAnalytics
	checkResult := db.GetDB().Where("url_id = ?", analytics.URLID).
		Where("referrer = ?", analytics.Referrer).
		Where("country = ?", analytics.Country).
		Where("city = ?", analytics.City).
		Where("device = ?", analytics.Device).
		Where("browser = ?", analytics.Browser).
		Where("os = ?", analytics.OS).
		Where("bucket_time = ?", analytics.BucketTime).
		First(&existingAnalytics)

	var result *gorm.DB
	if checkResult.Error == nil {
		// Record exists, update the click count at the database level to avoid race conditions
		result = db.GetDB().Model(&models.URLAnalytics{}).
			Where("url_id = ?", analytics.URLID).
			Where("referrer = ?", analytics.Referrer).
			Where("country = ?", analytics.Country).
			Where("city = ?", analytics.City).
			Where("device = ?", analytics.Device).
			Where("browser = ?", analytics.Browser).
			Where("os = ?", analytics.OS).
			Where("bucket_time = ?", analytics.BucketTime).
			Update("click_count", gorm.Expr("click_count + ?", 1))
	} else if checkResult.Error == gorm.ErrRecordNotFound {
		// Record doesn't exist, create a new one
		result = db.GetDB().Create(&analytics)
	} else {
		// Some other error occurred during the check
		result = checkResult
		logger.Log.Error(fmt.Sprintf("Error checking existing analytics: %v", checkResult.Error))
	}

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error tracking analytics: %v", result.Error))
	}

	// Add the engagement analytics to the database
	TrachEngagementAnalytics(analytics.URLID)

	// Update the URL total click count
	result = db.GetDB().Model(&models.URL{}).Where("id = ?", analytics.URLID).Update("total_clicks", gorm.Expr("total_clicks + ?", 1))

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error updating URL total click count: %v", result.Error))
	}

	return result
}

func TrachEngagementAnalytics(URLID uint64) *gorm.DB {
	// Round the current time to the nearest 2-minute bucket for consistent grouping
	now := time.Now()
	bucketTime := now.Truncate(2 * time.Minute)

	analytics := models.URLAnalytics{
		URLID:      URLID,
		Referrer:   "ENGAGEMENT",
		Country:    "ENGAGEMENT",
		City:       "ENGAGEMENT",
		Device:     "ENGAGEMENT",
		Browser:    "ENGAGEMENT",
		OS:         "ENGAGEMENT",
		ClickCount: 1,
		BucketTime: bucketTime,
	}

	// First check if the analytics record already exists
	var existingAnalytics models.URLAnalytics
	checkResult := db.GetDB().Where("url_id = ?", analytics.URLID).
		Where("referrer = ?", analytics.Referrer).
		Where("country = ?", analytics.Country).
		Where("city = ?", analytics.City).
		Where("device = ?", analytics.Device).
		Where("browser = ?", analytics.Browser).
		Where("os = ?", analytics.OS).
		Where("bucket_time = ?", analytics.BucketTime).
		First(&existingAnalytics)

	var result *gorm.DB
	if checkResult.Error == nil {
		// Record exists, update the click count at the database level to avoid race conditions
		result = db.GetDB().Model(&models.URLAnalytics{}).
			Where("url_id = ?", analytics.URLID).
			Where("referrer = ?", analytics.Referrer).
			Where("country = ?", analytics.Country).
			Where("city = ?", analytics.City).
			Where("device = ?", analytics.Device).
			Where("browser = ?", analytics.Browser).
			Where("os = ?", analytics.OS).
			Where("bucket_time = ?", analytics.BucketTime).
			Update("click_count", gorm.Expr("click_count + ?", 1))
	} else if checkResult.Error == gorm.ErrRecordNotFound {
		// Record doesn't exist, create a new one
		result = db.GetDB().Create(&analytics)
	} else {
		// Some other error occurred during the check
		result = checkResult
		logger.Log.Error(fmt.Sprintf("Error checking existing analytics: %v", checkResult.Error))
	}

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error tracking analytics: %v", result.Error))
	}

	// No need to update the URL total click count here since it's already done in TrackAllAnalytics
	// This prevents double-counting when both functions are called

	return result
}

// GetTotalClicks retrieves the total click count for a URL
func GetTotalClicks(urlID uint64) (int64, error) {
	var url models.URL
	result := db.GetDB().Select("total_clicks").Where("id = ?", urlID).First(&url)
	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving total clicks for URL ID %d: %v", urlID, result.Error))
		return 0, result.Error
	}
	return url.TotalClicks, nil
}

// GetURLsByWorkspaceID retrieves all URLs for a specified workspace ID
func GetURLsByWorkspaceID(workspaceID uint64) ([]models.URL, error) {
	var urls []models.URL

	// Use a more explicit join for preloading domains
	result := db.GetDB().
		Joins("LEFT JOIN domains ON urls.domain_id = domains.id").
		Preload("Domain").
		Where("urls.workspace_id = ?", workspaceID).
		Order("urls.created_at DESC").
		Find(&urls)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving URLs for workspace: %v", result.Error))
		return nil, result.Error
	}

	// Add fallback for domain ID 0 which might not be properly preloaded
	for i := range urls {
		if urls[i].Domain == nil && urls[i].DomainID == 0 {
			// Try to get the default domain (ID 0)
			var domain models.Domain
			if err := db.GetDB().First(&domain, 0).Error; err == nil {
				urls[i].Domain = &domain
			}
		}
	}

	return urls, nil
}

type TimeAccuracy string

const (
	Hourly  TimeAccuracy = "hourly"
	Daily   TimeAccuracy = "daily"
	Monthly TimeAccuracy = "monthly"
)

// Calculate the total time series data for a specific URL
func GetTotalTime(startDate time.Time, endDate time.Time) (time.Duration, TimeAccuracy, error) {
	total := endDate.Sub(startDate)

	// Return the data time accuracy should be return
	if total.Hours() <= 12 {
		return total, "", nil // Return original data
	} else if total.Hours() <= 336 {
		return total, Hourly, nil
	} else if total.Hours() <= 720 {
		return total, Daily, nil
	} else {
		return total, Monthly, nil
	}
}

// GetDiffrentTypeAnalyticsData retrieves analytics data for a specific URL by dataType (country, referrer, etc.)
func GetDiffrentTypeAnalyticsData(urlID uint64, page int, timeAccuracy TimeAccuracy, dataType string, startDate time.Time, endDate time.Time) ([]models.URLAnalytics, error) {
	var result []models.URLAnalytics

	offset := (page - 1) * 10

	// Note: We're not using time_bucket for this query since we're just grouping by dimensions
	// The timeAccuracy parameter is only used for reference in other functions

	// Validate dataType to prevent SQL injection
	validDataTypes := map[string]bool{
		"referrer": true,
		"country":  true,
		"city":     true,
		"device":   true,
		"browser":  true,
		"os":       true,
	}

	if !validDataTypes[dataType] {
		return nil, fmt.Errorf("invalid data type: %s", dataType)
	}

	// Build and execute the SQL query
	query := `
		SELECT 
			url_id, 
			` + dataType + `, 
			SUM(click_count) as total_clicks 
		FROM url_analytics 
		WHERE url_id = $1 
		AND bucket_time >= $2 
		AND bucket_time <= $3 
		GROUP BY url_id, ` + dataType + ` 
		ORDER BY total_clicks DESC 
		LIMIT 10 
		OFFSET $4
	`

	rows, err := db.GetDB().Raw(query, urlID, startDate, endDate, offset).Rows()
	if err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving analytics data for URL ID %d: %v", urlID, err))
		return nil, err
	}
	defer rows.Close()

	// Process the results
	for rows.Next() {
		var analytics models.URLAnalytics
		var totalClicks int64

		// We need dynamic scanning based on which field we're grouping by
		switch dataType {
		case "referrer":
			if err := rows.Scan(&analytics.URLID, &analytics.Referrer, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		case "country":
			if err := rows.Scan(&analytics.URLID, &analytics.Country, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		case "city":
			if err := rows.Scan(&analytics.URLID, &analytics.City, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		case "device":
			if err := rows.Scan(&analytics.URLID, &analytics.Device, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		case "browser":
			if err := rows.Scan(&analytics.URLID, &analytics.Browser, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		case "os":
			if err := rows.Scan(&analytics.URLID, &analytics.OS, &totalClicks); err != nil {
				logger.Log.Error(fmt.Sprintf("Error scanning analytics data row: %v", err))
				continue
			}
		}

		analytics.ClickCount = totalClicks
		result = append(result, analytics)
	}

	// Check for errors during row iteration
	if err := rows.Err(); err != nil {
		logger.Log.Error(fmt.Sprintf("Error iterating through analytics data rows: %v", err))
		return nil, err
	}

	return result, nil
}

// TimeSeriesDataPoint represents a single point in a time series chart
type TimeSeriesDataPoint struct {
	Timestamp  time.Time `json:"timestamp"`
	ClickCount int64     `json:"click_count"`
}

// GetTimeSeriesData retrieves time series data for a specific URL with optional filters
func GetTimeSeriesData(urlID uint64, timeAccuracy TimeAccuracy, filters map[string]string, startDate time.Time, endDate time.Time) ([]TimeSeriesDataPoint, error) {
	var result []TimeSeriesDataPoint

	// Determine time bucket interval based on time accuracy
	var interval string
	switch timeAccuracy {
	case Hourly:
		interval = "1 hour"
	case Daily:
		interval = "1 day"
	case Monthly:
		interval = "1 month"
	default:
		interval = "2 minutes" // Default to original data precision
	}

	// Build the base query
	baseQuery := `
		SELECT 
			time_bucket($1, bucket_time) as timestamp, 
			SUM(click_count) as click_count 
		FROM url_analytics 
		WHERE url_id = $2 
		AND bucket_time >= $3 
		AND bucket_time <= $4 
	`

	// Add filters if provided
	filterCount := 5 // Starting parameter count
	var additionalParams []interface{}
	additionalFilters := ""

	for field, value := range filters {
		if value != "" {
			// Validate field to prevent SQL injection
			switch field {
			case "referrer", "country", "city", "device", "browser", "os":
				additionalFilters += fmt.Sprintf(" AND %s = $%d", field, filterCount)
				additionalParams = append(additionalParams, value)
				filterCount++
			default:
				// Skip invalid fields
				logger.Log.Sugar().Warnf("Invalid filter field ignored: %s", field)
			}
		}
	}

	// Complete the query
	query := baseQuery + additionalFilters + ` GROUP BY timestamp ORDER BY timestamp ASC`

	// Prepare all parameters
	params := []interface{}{
		interval,  // $1 (interval for time_bucket)
		urlID,     // $2
		startDate, // $3
		endDate,   // $4
	}
	params = append(params, additionalParams...)

	// Execute the query
	rows, err := db.GetDB().Raw(query, params...).Rows()
	if err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving time series data for URL ID %d: %v", urlID, err))
		return nil, err
	}
	defer rows.Close()

	// Process the results
	for rows.Next() {
		var point TimeSeriesDataPoint
		if err := rows.Scan(&point.Timestamp, &point.ClickCount); err != nil {
			logger.Log.Error(fmt.Sprintf("Error scanning time series data row: %v", err))
			continue
		}
		result = append(result, point)
	}

	// Check for errors during row iteration
	if err := rows.Err(); err != nil {
		logger.Log.Error(fmt.Sprintf("Error iterating through time series data rows: %v", err))
		return nil, err
	}

	return result, nil
}
