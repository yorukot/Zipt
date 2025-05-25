package queries

import (
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
)

// For the add or update analytics data to the database
func TrackAllAnalytics(tracker models.URLAnalytics) *gorm.DB {
	now := time.Now()

	analytics := models.URLAnalytics{
		URLID:     tracker.URLID,
		Referrer:  tracker.Referrer,
		Country:   tracker.Country,
		City:      tracker.City,
		Device:    tracker.Device,
		Browser:   tracker.Browser,
		OS:        tracker.OS,
		CreatedAt: now,
	}

	var result *gorm.DB
	result = db.GetDB().Create(&analytics)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error tracking analytics: %v", result.Error))
	}

	// Update the URL total click count
	result = db.GetDB().Model(&models.URL{}).Where("id = ?", analytics.URLID).Update("total_clicks", gorm.Expr("total_clicks + ?", 1))

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error updating URL total click count: %v", result.Error))
	}

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
	TwoMinutes TimeAccuracy = "2min"
	Hourly     TimeAccuracy = "hourly"
	Daily      TimeAccuracy = "daily"
	Monthly    TimeAccuracy = "monthly"
)

// Calculate the total time series data for a specific URL
func GetTotalTime(startDate time.Time, endDate time.Time) (time.Duration, TimeAccuracy, error) {
	total := endDate.Sub(startDate)

	// Return the data time accuracy should be return
	if total.Hours() <= 24 {
		return total, TwoMinutes, nil // Return original data
		// 7 days
	} else if total.Hours() <= 24*7 {
		return total, Hourly, nil
		// 30 days
	} else if total.Hours() <= 24*30 {
		return total, Daily, nil
		// 2 years
	} else if total.Hours() <= 24*365*2 {
		return total, Monthly, nil
	} else {
		return total, Monthly, nil
	}
}

// AnalyticsDataPoint represents a data point for analytics by type (country, referrer, etc.)
type AnalyticsDataPoint struct {
	Value      string `json:"value"`
	TotalClicks int64  `json:"total_clicks"`
}

// GetDiffrentTypeAnalyticsData retrieves analytics data for a specific URL by dataType (country, referrer, etc.)
func GetDiffrentTypeAnalyticsData(urlID uint64, page int, timeAccuracy TimeAccuracy, dataType string, startDate time.Time, endDate time.Time) ([]AnalyticsDataPoint, error) {
	var analyticsData []AnalyticsDataPoint

	// If timeAccuracy is not provided, determine based on date range
	if timeAccuracy == "" {
		_, timeAccuracy, _ = GetTotalTime(startDate, endDate)
	}

	// Define the time field and table name based on time accuracy
	var tableName, timeField string

	switch timeAccuracy {
	case TwoMinutes:
		tableName = "url_analytics_2min"
		timeField = "bucket_2min"
	case Hourly:
		tableName = "url_analytics_hourlies"
		timeField = "bucket_hour"
	case Daily:
		tableName = "url_analytics_dailies"
		timeField = "bucket_day"
	case Monthly:
		tableName = "url_analytics_monthlies"
		timeField = "bucket_month"
	default:
		tableName = "url_analytics_2min"
		timeField = "bucket_2min"
	}

	// Validate dataType to prevent SQL injection
	var validDataType string
	switch dataType {
	case "referrer":
		validDataType = "referrer"
	case "country":
		validDataType = "country"
	case "city":
		validDataType = "city"
	case "device":
		validDataType = "device"
	case "browser":
		validDataType = "browser"
	case "os":
		validDataType = "os"
	default:
		return nil, fmt.Errorf("invalid data type: %s", dataType)
	}

	// Build and execute the query to get top 10 values by click count
	query := fmt.Sprintf(`SELECT 
		%s AS value,
		SUM(total_clicks) AS total_clicks
	FROM 
		%s
	WHERE 
		url_id = ?
		AND %s BETWEEN ? AND ?
	GROUP BY 
		%s
	ORDER BY 
		total_clicks DESC
	LIMIT 10 OFFSET ?`,
		validDataType, tableName, timeField, validDataType)

	// Calculate offset based on page number (0-indexed)
	offset := (page - 1) * 10
	if offset < 0 {
		offset = 0
	}

	args := []interface{}{urlID, startDate, endDate, offset}
	logger.Log.Sugar().Debugf("Analytics query: %s with args: %v", query, args)

	// Execute the query
	if err := db.GetDB().Raw(query, args...).Scan(&analyticsData).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving analytics data: %v", err))
		return []AnalyticsDataPoint{}, err
	}
	fmt.Println(analyticsData)
	return analyticsData, nil
}

// TimeSeriesDataPoint represents a single point in a time series chart
type TimeSeriesDataPoint struct {
	Timestamp  time.Time `json:"timestamp"`
	TotalClicks int64     `json:"total_clicks"`
}

// GetTimeSeriesData retrieves time series data for a specific URL with optional filters
func GetTimeSeriesData(urlID uint64, timeAccuracy TimeAccuracy, filters map[string]string, startDate time.Time, endDate time.Time) ([]TimeSeriesDataPoint, error) {
	var timeSeriesData []TimeSeriesDataPoint

	// If timeAccuracy is not provided, determine based on date range
	if timeAccuracy == "" {
		_, timeAccuracy, _ = GetTotalTime(startDate, endDate)
	}

	// Define the time field and table name based on time accuracy
	var tableName, timeField string

	switch timeAccuracy {
	case TwoMinutes:
		tableName = "url_analytics_2min"
		timeField = "bucket_2min"
	case Hourly:
		tableName = "url_analytics_hourlies"
		timeField = "bucket_hour"
	case Daily:
		tableName = "url_analytics_dailies"
		timeField = "bucket_day"
	case Monthly:
		tableName = "url_analytics_monthlies"
		timeField = "bucket_month"
	default:
		tableName = "url_analytics_2min"
		timeField = "bucket_2min"
	}

	// Build and execute the query
	query := fmt.Sprintf(`SELECT 
		%s AS timestamp,
		SUM(total_clicks) AS total_clicks
	FROM 
		%s
	WHERE 
		url_id = ?
		AND %s BETWEEN ? AND ?`,
		timeField, tableName, timeField)

	// Add filters if provided
	args := []interface{}{urlID, startDate, endDate}
	if len(filters) > 0 {
		for field, value := range filters {
			if value != "" {
				// Validate field to prevent SQL injection
				switch field {
				case "referrer", "country", "city", "device", "browser", "os":
					query += fmt.Sprintf(" AND %s = ?", field)
					args = append(args, value)
				}
			}
		}
	}

	// Complete the query with GROUP BY to aggregate by timestamp
	query += fmt.Sprintf(" GROUP BY %s ORDER BY %s ASC", timeField, timeField)
	logger.Log.Sugar().Debugf("Time series query: %s with args: %v", query, args)

	// Execute the query
	if err := db.GetDB().Raw(query, args...).Scan(&timeSeriesData).Error; err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving time series data: %v", err))
		return []TimeSeriesDataPoint{}, err
	}

	return timeSeriesData, nil
}
