package shortener

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// DeleteURL handles the deletion of a shortened URL
// This endpoint requires authentication and only allows users to delete their own URLs
func DeleteURL(c *gin.Context) {
	// Get user ID from context (set by middleware)
	_, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Get workspace ID from path parameter
	workspaceIDStr := c.Param("workspaceID")
	workspaceID, err := strconv.ParseUint(workspaceIDStr, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
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

	// Check if URL belongs to the specified workspace
	if url.WorkspaceID == nil || *url.WorkspaceID != workspaceID {
		utils.FullyResponse(c, http.StatusForbidden, "URL does not belong to this workspace", utils.ErrForbidden, nil)
		return
	}

	// Workspace permission is already verified by middleware.CheckWorkspaceRoleAndStore()
	// The middleware ensures the user has appropriate permissions for the workspace

	// Delete the URL
	result = queries.DeleteURLQueue(shortCode)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error deleting URL", utils.ErrSaveData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "URL deleted successfully", nil, nil)
}
