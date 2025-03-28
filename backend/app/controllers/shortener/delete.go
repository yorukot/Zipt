package shortener

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// DeleteURL handles the deletion of a shortened URL
// This endpoint requires authentication and only allows users to delete their own URLs
func DeleteURL(c *gin.Context) {
	// Verify authentication
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Get the URL ID from the route parameter
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Get the URL from database
	url, result := queries.GetURLQueueByShortCode(shortCode)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify ownership - only the URL owner can delete it
	if url.UserID == nil || *url.UserID != userID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to delete this URL", utils.ErrForbidden, nil)
		return
	}

	// Delete the URL
	result = queries.DeleteURLQueue(shortCode)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error deleting URL", utils.ErrSaveData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "URL deleted successfully", nil, nil)
}
