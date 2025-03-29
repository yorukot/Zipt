package workspace

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// UpdateWorkspace updates a workspace
func UpdateWorkspace(c *gin.Context) {
	workspaceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
		return
	}

	var req WorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	// Get workspace role from context (set by auth middleware)
	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this workspace", utils.ErrForbidden, nil)
		return
	}

	if workspaceRole != queries.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this workspace", utils.ErrForbidden, nil)
		return
	}

	// Update the workspace (only admins can update)
	err = queries.UpdateWorkspace(workspaceID, req.Name,)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to update workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace updated successfully", nil, nil)
}
