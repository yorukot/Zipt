package shortener

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/logger"
	"github.com/yorukot/zipt/pkg/utils"
)

// AnalyticsDataType defines the types of analytics data we can retrieve
type AnalyticsDataType string

const (
	Referrer AnalyticsDataType = "referrer"
	Country  AnalyticsDataType = "country"
	City     AnalyticsDataType = "city"
	Device   AnalyticsDataType = "device"
	Browser  AnalyticsDataType = "browser"
	OS       AnalyticsDataType = "os"
)

// GetURLAnalytics returns analytics data for a specific URL
// This endpoint requires authentication
func GetURLAnalytics(c *gin.Context) {
	// This endpoint should be protected by authentication middleware
	_, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	workspaceID, workspaceExists := c.Get("workspaceID")
	if !workspaceExists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// Safely convert workspaceID to uint64
	workspaceIDUint, ok := workspaceID.(uint64)
	if !ok {
		utils.FullyResponse(c, http.StatusInternalServerError, "Invalid workspace ID type", utils.ErrGetData, nil)
		return
	}

	urlID, err := utils.StrToUint64(c.Param("urlID"))
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid URL ID format", utils.ErrBadRequest, err.Error())
		return
	}

	// Get URL data
	url, result := queries.GetURLQueueByID(urlID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify workspace access - URLs belong to workspaces in this application
	if url.WorkspaceID == nil || *url.WorkspaceID != workspaceIDUint {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to view analytics for this URL", utils.ErrForbidden, nil)
		return
	}

	// Get time range from query parameters
	endDate := c.Query("end")
	startDate := c.Query("start")
	// If the user not gave the end date or the start date, we will use the current time (10 hours ago)
	if endDate == "" {
		endDate = strconv.FormatInt(time.Now().Unix(), 10)
	}
	if startDate == "" {
		startDate = strconv.FormatInt(time.Now().Add(-time.Hour*10).Unix(), 10)
	}

	// Parse numeric Unix timestamps
	endTimestamp, err := strconv.ParseInt(endDate, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid end date format", utils.ErrBadRequest, err.Error())
		return
	}
	parsedEndDate := time.Unix(endTimestamp, 0)

	startTimestamp, err := strconv.ParseInt(startDate, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid start date format", utils.ErrBadRequest, err.Error())
		return
	}
	parsedStartDate := time.Unix(startTimestamp, 0)

	// Validate time range and swap if necessary
	if parsedEndDate.Before(parsedStartDate) {
		logger.Log.Sugar().Warnf("End date (%s) is before start date (%s), swapping them",
			parsedEndDate.Format(time.RFC3339), parsedStartDate.Format(time.RFC3339))
		parsedEndDate, parsedStartDate = parsedStartDate, parsedEndDate
	}

	// Debug the date range
	logger.Log.Sugar().Infof("Querying analytics with date range: %s to %s",
		parsedStartDate.Format(time.RFC3339), parsedEndDate.Format(time.RFC3339))

	_, timeAccuracy, err := queries.GetTotalTime(parsedStartDate, parsedEndDate)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid time range", utils.ErrBadRequest, err.Error())
		return
	}

	// Map to store all analytics results
	analyticsData := make(map[AnalyticsDataType][]queries.AnalyticsDataPoint)

	// Function to fetch analytics data by type
	fetchAnalytics := func(dataType AnalyticsDataType) error {
		data, err := queries.GetDiffrentTypeAnalyticsData(url.ID, 1, timeAccuracy, string(dataType), parsedStartDate, parsedEndDate)
		if err != nil {
			return err
		}
		analyticsData[dataType] = data
		return nil
	}

	// Fetch all analytics data types
	for _, dataType := range []AnalyticsDataType{Referrer, Country, City, Device, Browser, OS} {
		if err := fetchAnalytics(dataType); err != nil {
			logger.Log.Sugar().Errorf("Error retrieving analytics data for %s: %v", dataType, err)
		}
	}

	// Ensure all analytics fields are non-nil slices
	for _, dataType := range []AnalyticsDataType{Referrer, Country, City, Device, Browser, OS} {
		if analyticsData[dataType] == nil {
			analyticsData[dataType] = make([]queries.AnalyticsDataPoint, 0)
		}
	}

	// Even if some analytics types failed, return what we have
	c.JSON(http.StatusOK, gin.H{
		"url": gin.H{
			"short_code":   url.ShortCode,
			"original_url": url.OriginalURL,
			"total_clicks": url.TotalClicks,
			"created_at":   url.CreatedAt,
			"expires_at":   url.ExpiresAt,
		},
		"analytics": gin.H{
			"total_clicks": url.TotalClicks,
			"referrer":     analyticsData[Referrer],
			"country":      analyticsData[Country],
			"city":         analyticsData[City],
			"device":       analyticsData[Device],
			"browser":      analyticsData[Browser],
			"os":           analyticsData[OS],
		},
	})
}

// GetURLTimeSeriesData returns time series data for a specific URL with optional filters
// This endpoint requires authentication
func GetURLTimeSeriesData(c *gin.Context) {
	// This endpoint should be protected by authentication middleware
	_, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	workspaceID, workspaceExists := c.Get("workspaceID")
	if !workspaceExists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// Safely convert workspaceID to uint64
	workspaceIDUint, ok := workspaceID.(uint64)
	if !ok {
		utils.FullyResponse(c, http.StatusInternalServerError, "Invalid workspace ID type", utils.ErrGetData, nil)
		return
	}

	urlID, err := utils.StrToUint64(c.Param("urlID"))
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid URL ID format", utils.ErrBadRequest, err.Error())
		return
	}

	// Get URL data
	url, result := queries.GetURLQueueByID(urlID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify workspace access - URLs belong to workspaces in this application
	if url.WorkspaceID == nil || *url.WorkspaceID != workspaceIDUint {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to view analytics for this URL", utils.ErrForbidden, nil)
		return
	}

	// Get time range from query parameters
	endDate := c.Query("end")
	startDate := c.Query("start")
	// If the user not gave the end date or the start date, we will use the current time (10 hours ago)
	if endDate == "" {
		endDate = strconv.FormatInt(time.Now().Unix(), 10)
	}
	if startDate == "" {
		startDate = strconv.FormatInt(time.Now().Add(-time.Hour*10).Unix(), 10)
	}

	// Parse numeric Unix timestamps
	endTimestamp, err := strconv.ParseInt(endDate, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid end date format", utils.ErrBadRequest, err.Error())
		return
	}
	parsedEndDate := time.Unix(endTimestamp, 0)

	startTimestamp, err := strconv.ParseInt(startDate, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid start date format", utils.ErrBadRequest, err.Error())
		return
	}
	parsedStartDate := time.Unix(startTimestamp, 0)

	// Validate time range and swap if necessary
	if parsedEndDate.Before(parsedStartDate) {
		logger.Log.Sugar().Warnf("End date (%s) is before start date (%s), swapping them",
			parsedEndDate.Format(time.RFC3339), parsedStartDate.Format(time.RFC3339))
		parsedEndDate, parsedStartDate = parsedStartDate, parsedEndDate
	}

	// Debug the date range
	logger.Log.Sugar().Infof("Querying analytics with date range: %s to %s",
		parsedStartDate.Format(time.RFC3339), parsedEndDate.Format(time.RFC3339))

	_, timeAccuracy, err := queries.GetTotalTime(parsedStartDate, parsedEndDate)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid time range", utils.ErrBadRequest, err.Error())
		return
	}

	// Collect filters from query parameters
	filters := make(map[string]string)

	// Check for valid filter parameters
	for _, field := range []string{"referrer", "country", "city", "device", "browser", "os"} {
		if value := c.Query(field); value != "" {
			filters[field] = value
		}
	}

	// Get time series data with filters
	timeSeriesData, err := queries.GetTimeSeriesData(url.ID, timeAccuracy, filters, parsedStartDate, parsedEndDate)
	if err != nil {
		// Log the error but still proceed to return an empty array instead of returning an error
		logger.Log.Sugar().Errorf("Error retrieving time series data: %v", err)
		timeSeriesData = []queries.TimeSeriesDataPoint{} // Return empty array instead of failing
	}

	// Determine the granularity description for frontend
	var granularityDesc string
	switch timeAccuracy {
	case queries.Hourly:
		granularityDesc = "hourly"
	case queries.Daily:
		granularityDesc = "daily"
	case queries.Monthly:
		granularityDesc = "monthly"
	default:
		granularityDesc = "minute"
	}

	c.JSON(http.StatusOK, gin.H{
		"url": gin.H{
			"id":           url.ID,
			"short_code":   url.ShortCode,
			"original_url": url.OriginalURL,
		},
		"time_series": gin.H{
			"data":        timeSeriesData,
			"granularity": granularityDesc,
			"filters":     filters,
			"date_range": gin.H{
				"start": parsedStartDate,
				"end":   parsedEndDate,
			},
		},
	})
}
