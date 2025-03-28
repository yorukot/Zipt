package shortener

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// GetURLAnalytics returns analytics data for a specific URL
// This endpoint requires authentication
func GetURLAnalytics(c *gin.Context) {
	// This endpoint should be protected by authentication middleware
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
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

	// Verify ownership - only allow the creator to see analytics
	// Skip this check for admins or if URL was created anonymously
	if url.UserID != nil && *url.UserID != userID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to view analytics for this URL", utils.ErrForbidden, nil)
		return
	}

	// Get analytics summary
	summary, err := queries.GetAnalyticsSummaryByURLID(url.ID)
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

// GetUserURLs returns all URLs created by the authenticated user
func GetUserURLs(c *gin.Context) {
	// This endpoint should be protected by authentication middleware
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Get user's URLs
	urls, err := queries.GetUserURLSummaries(userID.(uint64))
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving URLs", utils.ErrGetData, err)
		return
	}

	// Return user's URLs
	utils.FullyResponse(c, http.StatusOK, "URLs retrieved successfully", nil, gin.H{
		"urls": urls,
	})
}
