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
	// Get user ID from context (set by middleware)
	_, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Get workspace ID from path parameter
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID := workspaceIDAny.(uint64)

	// Get the URL ID from the route parameter
	urlID := c.Param("urlID")
	if urlID == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "URL ID is required", utils.ErrBadRequest, nil)
		return
	}

	urlIDUint, err := utils.StrToUint64(urlID)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid URL ID", utils.ErrBadRequest, nil)
		return
	}

	// Get the URL from database
	url, result := queries.GetURLQueueByID(urlIDUint)
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
	result = queries.DeleteURLQueueByID(url.ID)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error deleting URL", utils.ErrSaveData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "URL deleted successfully", nil, nil)
}
