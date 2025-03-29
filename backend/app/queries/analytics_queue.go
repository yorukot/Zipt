package queries

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
)

// getBucketTimestamp rounds a timestamp to the nearest bucket based on the granularity
func getBucketTimestamp(t time.Time, granularity string) time.Time {
	switch granularity {
	case "2min":
		// Round to the nearest 2-minute interval
		minutes := t.Minute()
		roundedMinutes := (minutes / 2) * 2 // Round down to nearest multiple of 2
		return time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), roundedMinutes, 0, 0, t.Location())
	case "hour":
		// Round to the hour
		return time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), 0, 0, 0, t.Location())
	case "day":
		// Round to the day
		return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
	case "month":
		// Round to the month
		return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
	default:
		// Default to exact time (no rounding)
		return t
	}
}

// updateURLMetrics updates analytics metrics for raw 2-minute granularity
// TimescaleDB continuous aggregation will handle creating hourly, daily, and monthly aggregates
func updateURLMetrics(urlID uint64, metricType string, value string, clickCount int64) {
	now := time.Now()
	// Only update the raw 2-minute data - TimescaleDB handles aggregation to other granularities
	updateMetricForGranularity(urlID, metricType, value, clickCount, "2min", now)
}

// updateMetricForGranularity updates analytics for a specific time granularity
func updateMetricForGranularity(urlID uint64, metricType string, value string, clickCount int64, granularity string, timestamp time.Time) {
	// Get the bucket timestamp for this granularity
	bucketTime := getBucketTimestamp(timestamp, granularity)

	// Check if a record already exists for this time bucket
	var metric models.URLMetric
	result := db.GetDB().Where("url_id = ? AND metric_type = ? AND metric_value = ? AND granularity = ? AND bucket_time = ?",
		urlID, metricType, value, granularity, bucketTime).First(&metric)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create a new record for this time bucket
			metric = models.URLMetric{
				URLID:       urlID,
				MetricType:  metricType,
				MetricValue: value,
				Granularity: granularity,
				BucketTime:  bucketTime,
				ClickCount:  clickCount,
				CreatedAt:   timestamp,
				UpdatedAt:   timestamp,
			}
			result = db.GetDB().Create(&metric)
			if result.Error != nil {
				logger.Log.Error(fmt.Sprintf("Failed to create URL metric record: %v", result.Error))
			}
		} else {
			logger.Log.Error(fmt.Sprintf("Error finding URL metric: %v", result.Error))
		}
		return
	}

	// Update the existing record
	metric.ClickCount += clickCount
	metric.UpdatedAt = timestamp

	result = db.GetDB().Save(&metric)
	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL metric: %v", result.Error))
	}
}

// TrackURLReferrer tracks a referrer for a specific URL
func TrackURLReferrer(urlID uint64, referrer string) *gorm.DB {
	// Sanitize empty or overly long referrers
	if referrer == "" {
		referrer = "direct"
	}

	// Update metrics directly
	updateURLMetrics(urlID, "referrer", referrer, 1)

	// Return a successful result
	return &gorm.DB{}
}

// TrackURLClick increments the total click count for a URL
func TrackURLClick(urlID uint64) *gorm.DB {
	// Update the total_click in the URLs table
	result := db.GetDB().Model(&models.URL{}).Where("id = ?", urlID).
		UpdateColumn("total_click", gorm.Expr("total_click + ?", 1))

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Failed to update URL total click: %v", result.Error))
		return result
	}

	// Update metrics directly
	updateURLMetrics(urlID, "clicks", "total", 1)

	return result
}

// TrackURLCountry tracks a country for a specific URL
func TrackURLCountry(urlID uint64, country string) *gorm.DB {
	// Sanitize empty country or invalid codes
	if country == "" || len(country) > 2 {
		country = "XX" // Use XX for unknown country
	}

	// Ensure country code is uppercase
	country = strings.ToUpper(country)

	// Update metrics directly
	updateURLMetrics(urlID, "country", country, 1)

	// Return a successful result
	return &gorm.DB{}
}

// TrackURLCity tracks a city for a specific URL
func TrackURLCity(urlID uint64, city string) *gorm.DB {
	// Skip if city is empty
	if city == "" {
		return nil
	}

	// Update metrics directly
	updateURLMetrics(urlID, "city", city, 1)

	// Return a successful result
	return &gorm.DB{}
}

// TrackAllAnalytics is a convenience function to update all analytics at once
func TrackAllAnalytics(urlID uint64, referrer string, ipAddress string, country string, city string) *gorm.DB {
	var finalResult *gorm.DB

	// Update click count in URL table
	finalResult = TrackURLClick(urlID)
	if finalResult != nil && finalResult.Error != nil {
		return finalResult
	}

	// Track referrer
	TrackURLReferrer(urlID, referrer)

	// Track country
	TrackURLCountry(urlID, country)

	// Track city
	TrackURLCity(urlID, city)

	// Log IP address for future analysis
	logger.Log.Sugar().Debugf("Click from IP: %s", ipAddress)

	// Return last result or success
	return finalResult
}

// GetAnalyticsMetrics retrieves analytics metrics for a specific URL
// This function automatically selects the appropriate time granularity based on the time range
func GetAnalyticsMetrics(urlID uint64, metricType string, startTime, endTime time.Time) ([]models.URLMetric, error) {
	var metrics []models.URLMetric
	var table string
	var result *gorm.DB

	// Determine the appropriate table based on time range
	duration := endTime.Sub(startTime)

	if duration <= 12*time.Hour {
		// For short time ranges (up to 12 hours), use 2-minute data
		table = "url_metrics"
	} else if duration <= 14*24*time.Hour {
		// For medium time ranges (up to 14 days), use hourly data
		table = "url_metrics_hourly"
	} else if duration <= 365*24*time.Hour {
		// For long time ranges (up to 1 year), use daily data
		table = "url_metrics_daily"
	} else {
		// For very long time ranges (over 1 year), use monthly data
		table = "url_metrics_monthly"
	}

	// Check if TimescaleDB is enabled
	if db.IsTimescaleEnabled {
		// Execute query using TimescaleDB materialized view
		query := fmt.Sprintf(`
			SELECT url_id, bucket_time, metric_type, metric_value, granularity, click_count 
			FROM %s 
			WHERE url_id = ? AND metric_type = ? AND bucket_time BETWEEN ? AND ?
			ORDER BY bucket_time ASC
		`, table)

		result = db.GetDB().Raw(query, urlID, metricType, startTime, endTime).Scan(&metrics)
	} else {
		// Fallback to direct query on the main table with filtering
		var granularity string

		if duration <= 12*time.Hour {
			granularity = "2min"
		} else if duration <= 14*24*time.Hour {
			granularity = "hour"
		} else if duration <= 365*24*time.Hour {
			granularity = "day"
		} else {
			granularity = "month"
		}

		result = db.GetDB().
			Table("url_metrics").
			Where("url_id = ? AND metric_type = ? AND granularity = ? AND bucket_time BETWEEN ? AND ?",
				urlID, metricType, granularity, startTime, endTime).
			Order("bucket_time ASC").
			Find(&metrics)
	}

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error querying analytics metrics: %v", result.Error))
		return nil, result.Error
	}

	return metrics, nil
}

// GetURLMetricsByType retrieves metrics for a specific URL and metric type (e.g., referrer, country)
func GetURLMetricsByType(urlID uint64, metricType string, limit int) ([]models.URLMetric, error) {
	var metrics []models.URLMetric

	result := db.GetDB().
		Table("url_metrics").
		Select("url_id, metric_type, metric_value, SUM(click_count) as click_count").
		Where("url_id = ? AND metric_type = ?", urlID, metricType).
		Group("url_id, metric_type, metric_value").
		Order("click_count DESC").
		Limit(limit).
		Find(&metrics)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error querying URL metrics by type: %v", result.Error))
		return nil, result.Error
	}

	return metrics, nil
}

// GetURLClicksOverTime retrieves click counts over time for a specific URL
func GetURLClicksOverTime(urlID uint64, startTime, endTime time.Time) ([]models.URLMetric, error) {
	return GetAnalyticsMetrics(urlID, "clicks", startTime, endTime)
}

// GetURLReferrersOverTime retrieves referrer data over time for a specific URL
func GetURLReferrersOverTime(urlID uint64, startTime, endTime time.Time) ([]models.URLMetric, error) {
	return GetAnalyticsMetrics(urlID, "referrer", startTime, endTime)
}

// GetURLCountriesOverTime retrieves country data over time for a specific URL
func GetURLCountriesOverTime(urlID uint64, startTime, endTime time.Time) ([]models.URLMetric, error) {
	return GetAnalyticsMetrics(urlID, "country", startTime, endTime)
}

// GetURLCitiesOverTime retrieves city data over time for a specific URL
func GetURLCitiesOverTime(urlID uint64, startTime, endTime time.Time) ([]models.URLMetric, error) {
	return GetAnalyticsMetrics(urlID, "city", startTime, endTime)
}

// GetTopReferrers returns the top referrers for a specific URL
func GetTopReferrers(urlID uint64, limit int) ([]models.URLMetric, error) {
	return GetURLMetricsByType(urlID, "referrer", limit)
}

// GetTopCountries returns the top countries for a specific URL
func GetTopCountries(urlID uint64, limit int) ([]models.URLMetric, error) {
	return GetURLMetricsByType(urlID, "country", limit)
}

// GetTopCities returns the top cities for a specific URL
func GetTopCities(urlID uint64, limit int) ([]models.URLMetric, error) {
	return GetURLMetricsByType(urlID, "city", limit)
}

// AnalyticsSummary represents a summary of analytics data for a URL
type AnalyticsSummary struct {
	TotalClicks   int64                `json:"total_clicks"`
	TopReferrers  []models.URLMetric   `json:"top_referrers"`
	TopCountries  []models.URLMetric   `json:"top_countries"`
	TopCities     []models.URLMetric   `json:"top_cities"`
	ClicksOverDay []models.URLMetric   `json:"clicks_over_day"`
	DateRange     map[string]time.Time `json:"date_range"`
}

// TimePeriod represents a time range for analytics
type TimePeriod struct {
	Start time.Time
	End   time.Time
}

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Page     int
	PageSize int
	Offset   int
}

// ParseTimeRange parses individual time range parameters (days, hours, mins, months, years)
func ParseTimeRange(days, hours, mins, months, years string) (TimePeriod, error) {
	now := time.Now()
	end := now
	start := now

	// Parse each duration parameter if provided
	if days != "" {
		daysVal, err := strconv.Atoi(days)
		if err != nil {
			return TimePeriod{}, fmt.Errorf("invalid days value: %s", days)
		}
		if daysVal > 0 {
			start = start.Add(-time.Duration(daysVal) * 24 * time.Hour)
		}
	}

	if hours != "" {
		hoursVal, err := strconv.Atoi(hours)
		if err != nil {
			return TimePeriod{}, fmt.Errorf("invalid hours value: %s", hours)
		}
		if hoursVal > 0 {
			start = start.Add(-time.Duration(hoursVal) * time.Hour)
		}
	}

	if mins != "" {
		minsVal, err := strconv.Atoi(mins)
		if err != nil {
			return TimePeriod{}, fmt.Errorf("invalid minutes value: %s", mins)
		}
		if minsVal > 0 {
			start = start.Add(-time.Duration(minsVal) * time.Minute)
		}
	}

	if months != "" {
		monthsVal, err := strconv.Atoi(months)
		if err != nil {
			return TimePeriod{}, fmt.Errorf("invalid months value: %s", months)
		}
		if monthsVal > 0 {
			// Approximate a month as 30 days
			start = start.Add(-time.Duration(monthsVal) * 30 * 24 * time.Hour)
		}
	}

	if years != "" {
		yearsVal, err := strconv.Atoi(years)
		if err != nil {
			return TimePeriod{}, fmt.Errorf("invalid years value: %s", years)
		}
		if yearsVal > 0 {
			// Approximate a year as 365 days
			start = start.Add(-time.Duration(yearsVal) * 365 * 24 * time.Hour)
		}
	}

	// If no parameters provided, default to last 24 hours
	if days == "" && hours == "" && mins == "" && months == "" && years == "" {
		start = now.Add(-24 * time.Hour)
	}

	return TimePeriod{
		Start: start,
		End:   end,
	}, nil
}

// NewPaginationParams creates pagination parameters
func NewPaginationParams(page, pageSize int) PaginationParams {
	if page < 1 {
		page = 1
	}

	if pageSize < 1 {
		pageSize = 10
	}

	if pageSize > 100 {
		pageSize = 100 // Maximum page size
	}

	offset := (page - 1) * pageSize

	return PaginationParams{
		Page:     page,
		PageSize: pageSize,
		Offset:   offset,
	}
}

// GetAnalyticsSummaryByURLID retrieves a summary of analytics data for a URL
func GetAnalyticsSummaryByURLID(urlID uint64, days, hours, mins, months, years string) (AnalyticsSummary, error) {
	var summary AnalyticsSummary

	// Parse the time range
	period, err := ParseTimeRange(days, hours, mins, months, years)
	if err != nil {
		return summary, err
	}

	// Get total clicks from the URL table
	var url models.URL
	result := db.GetDB().Where("id = ?", urlID).First(&url)
	if result.Error != nil {
		return summary, result.Error
	}

	summary.TotalClicks = url.TotalClick

	// Get top 10 referrers
	topReferrers, err := GetTopReferrers(urlID, 10)
	if err != nil {
		return summary, err
	}
	summary.TopReferrers = topReferrers

	// Get top 10 countries
	topCountries, err := GetTopCountries(urlID, 10)
	if err != nil {
		return summary, err
	}
	summary.TopCountries = topCountries

	// Get top 10 cities
	topCities, err := GetTopCities(urlID, 10)
	if err != nil {
		return summary, err
	}
	summary.TopCities = topCities

	// Get clicks over the specified period
	clicksOverDay, err := GetURLClicksOverTime(urlID, period.Start, period.End)
	if err != nil {
		return summary, err
	}
	summary.ClicksOverDay = clicksOverDay

	// Add date range to response
	summary.DateRange = map[string]time.Time{
		"start": period.Start,
		"end":   period.End,
	}

	return summary, nil
}

// GetPaginatedMetrics retrieves paginated metrics of a specific type for a URL
func GetPaginatedMetrics(urlID uint64, metricType string, pagination PaginationParams) ([]models.URLMetric, int64, error) {
	var metrics []models.URLMetric
	var totalCount int64

	// Get total count first
	result := db.GetDB().
		Table("url_metrics").
		Where("url_id = ? AND metric_type = ?", urlID, metricType).
		Group("url_id, metric_type, metric_value").
		Count(&totalCount)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	// Then get paginated results with aggregated data
	result = db.GetDB().
		Table("url_metrics").
		Select("url_id, metric_type, metric_value, SUM(click_count) as click_count").
		Where("url_id = ? AND metric_type = ?", urlID, metricType).
		Group("url_id, metric_type, metric_value").
		Order("click_count DESC").
		Limit(pagination.PageSize).
		Offset(pagination.Offset).
		Find(&metrics)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error querying paginated URL metrics: %v", result.Error))
		return nil, 0, result.Error
	}

	return metrics, totalCount, nil
}

// GetURLsByWorkspaceID retrieves all URLs for a specified workspace ID
func GetURLsByWorkspaceID(workspaceID uint64) ([]models.URL, error) {
	var urls []models.URL

	result := db.GetDB().
		Where("workspace_id = ?", workspaceID).
		Order("created_at DESC").
		Find(&urls)

	if result.Error != nil {
		logger.Log.Error(fmt.Sprintf("Error retrieving URLs for workspace: %v", result.Error))
		return nil, result.Error
	}

	return urls, nil
}
