package workspace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// UpdateWorkspace updates a workspace
func UpdateWorkspace(c *gin.Context) {
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID := workspaceIDAny.(uint64)

	var req WorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, nil)
		return
	}

	// Get workspace role from context (set by auth middleware)
	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this workspace", utils.ErrForbidden, nil)
		return
	}

	if workspaceRole != models.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this workspace", utils.ErrForbidden, nil)
		return
	}

	// Get workspace first
	workspace, result := queries.GetWorkspaceQueueByID(workspaceID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Workspace not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Update the workspace (only owners can update)
	updates := map[string]interface{}{
		"name": req.Name,
	}

	result = queries.UpdateWorkspaceQueue(workspace, updates)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to update workspace", utils.ErrSaveData, map[string]interface{}{
			"details": result.Error.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace updated successfully", nil, nil)
}
