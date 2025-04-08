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

	result := db.GetDB().
		Preload("Domain"). // Preload the domain information
		Where("workspace_id = ?", workspaceID).
		Order("created_at DESC").
		Find(&urls)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving URLs for workspace: %v", result.Error))
		return nil, result.Error
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

// GetAnalyticsDataByCountry retrieves analytics data for a specific URL by country
func GetDiffrentTypeAnalyticsData(urlID uint64, page int, timeAccuracy TimeAccuracy, dataType string, startDate time.Time, endDate time.Time) ([]models.URLAnalytics, error) {
	var result []models.URLAnalytics

	offset := (page - 1) * 10

	var vmodel any

	switch timeAccuracy {
	case Hourly:
		vmodel = models.URLAnalyticsHourly{}
	case Daily:
		vmodel = models.URLAnalyticsDaily{}
	case Monthly:
		vmodel = models.URLAnalyticsMonthly{}
	default:
		vmodel = models.URLAnalytics{}
	}

	// TODO: Add page and page size
	err := db.GetDB().Model(&vmodel).
		Select(fmt.Sprintf("url_id, %s, SUM(click_count) as total_clicks", dataType)).
		Where("url_id = ?", urlID).
		Where("bucket_time >= ?", startDate).
		Where("bucket_time <= ?", endDate).
		Group(fmt.Sprintf("url_id, %s", dataType)).
		Order("total_clicks DESC").
		Limit(10).
		Offset(offset).
		Find(&result).Error

	if err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving analytics data for URL ID %d: %v", urlID, err))
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

	// Select the appropriate model based on time accuracy
	var vmodel any
	var groupByFormat string

	switch timeAccuracy {
	case Hourly:
		vmodel = models.URLAnalyticsHourly{}
		groupByFormat = "hour"
	case Daily:
		vmodel = models.URLAnalyticsDaily{}
		groupByFormat = "day"
	case Monthly:
		vmodel = models.URLAnalyticsMonthly{}
		groupByFormat = "month"
	default:
		vmodel = models.URLAnalytics{}
		groupByFormat = "minute"
	}

	// Start building the query
	query := db.GetDB().Model(&vmodel).
		Select(fmt.Sprintf("date_trunc('%s', bucket_time) as timestamp, SUM(click_count) as click_count", groupByFormat)).
		Where("url_id = ?", urlID).
		Where("bucket_time >= ?", startDate).
		Where("bucket_time <= ?", endDate)

	// Add filters if provided
	for field, value := range filters {
		if value != "" {
			// Validate field to prevent SQL injection
			switch field {
			case "referrer", "country", "city", "device", "browser", "os":
				query = query.Where(fmt.Sprintf("%s = ?", field), value)
			default:
				// Skip invalid fields
				logger.Log.Sugar().Warnf("Invalid filter field ignored: %s", field)
			}
		}
	}

	// Complete the query with grouping and ordering
	err := query.
		Group("timestamp").
		Order("timestamp ASC").
		Find(&result).Error

	if err != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving time series data for URL ID %d: %v", urlID, err))
		return nil, err
	}

	return result, nil
}
