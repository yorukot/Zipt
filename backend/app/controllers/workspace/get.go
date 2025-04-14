package workspace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// GetWorkspaces returns workspaces for the current user
func GetWorkspaces(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}

	workspaces, result := queries.GetUserWorkspacesQueue(userID.(uint64))
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get workspaces", utils.ErrGetData, map[string]interface{}{
			"details": result.Error.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspaces fetched successfully", nil, workspaces)
}

// GetWorkspace returns a single workspace by ID
func GetWorkspace(c *gin.Context) {
	// Get workspace ID from context (set by middleware)
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID := workspaceIDAny.(uint64)

	workspace, result := queries.GetWorkspaceQueueByID(workspaceID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Workspace not found", utils.ErrResourceNotFound, nil)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace fetched successfully", nil, workspace)
}
