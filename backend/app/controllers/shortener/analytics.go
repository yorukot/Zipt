package shortener

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
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

	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Get time range from query parameters
	days := c.Query("days")
	hours := c.Query("hours")
	mins := c.Query("mins")
	months := c.Query("months")
	years := c.Query("years")

	// Get URL data
	url, result := queries.GetURLQueueByShortCode(shortCode)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify workspace access - URLs belong to workspaces in this application
	if url.WorkspaceID == nil || *url.WorkspaceID != workspaceID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to view analytics for this URL", utils.ErrForbidden, nil)
		return
	}

	// Get analytics summary with time range
	summary, err := queries.GetAnalyticsSummaryByURLID(url.ID, days, hours, mins, months, years)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving analytics", utils.ErrGetData, err)
		return
	}

	// Return statistics
	utils.FullyResponse(c, http.StatusOK, "Analytics retrieved successfully", nil, gin.H{
		"url": gin.H{
			"short_code":   url.ShortCode,
			"original_url": url.OriginalURL,
			"total_clicks": summary.TotalClicks,
			"created_at":   url.CreatedAt,
			"expires_at":   url.ExpiresAt,
		},
		"analytics": summary,
	})
}

// GetPaginatedURLMetrics returns paginated metrics for a specific URL and metric type
// This endpoint requires authentication
func GetPaginatedURLMetrics(c *gin.Context) {
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

	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Get URL data
	url, result := queries.GetURLQueueByShortCode(shortCode)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify workspace access - URLs belong to workspaces in this application
	if url.WorkspaceID == nil || *url.WorkspaceID != workspaceID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to view analytics for this URL", utils.ErrForbidden, nil)
		return
	}

	// Get metric type from query parameters (e.g., ?type=referrer)
	metricType := c.DefaultQuery("type", "referrer")

	// Valid metric types
	validTypes := map[string]bool{
		"referrer": true,
		"country":  true,
		"city":     true,
		"clicks":   true,
	}

	if !validTypes[metricType] {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid metric type. Valid types: referrer, country, city, clicks", utils.ErrBadRequest, nil)
		return
	}

	// Get pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	pagination := queries.NewPaginationParams(page, pageSize)

	// Get paginated metrics
	metrics, totalCount, err := queries.GetPaginatedMetrics(url.ID, metricType, pagination)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving metrics", utils.ErrGetData, err)
		return
	}

	// Calculate total pages
	totalPages := (totalCount + int64(pageSize) - 1) / int64(pageSize)

	// Return paginated metrics
	utils.FullyResponse(c, http.StatusOK, "Metrics retrieved successfully", nil, gin.H{
		"url": gin.H{
			"short_code":   url.ShortCode,
			"original_url": url.OriginalURL,
		},
		"metrics": gin.H{
			"type":        metricType,
			"data":        metrics,
			"pagination":  pagination,
			"total_count": totalCount,
			"total_pages": totalPages,
		},
	})
}

// GetUserURLs returns all URLs created by the authenticated user
func GetUserURLs(c *gin.Context) {
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

	// Get workspace's URLs
	urls, err := queries.GetURLsByWorkspaceID(workspaceID.(uint64))
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving URLs", utils.ErrGetData, err)
		return
	}

	// Return workspace's URLs
	utils.FullyResponse(c, http.StatusOK, "URLs retrieved successfully", nil, gin.H{
		"urls": urls,
	})
}
