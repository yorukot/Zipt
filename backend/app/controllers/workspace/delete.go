package workspace

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// DeleteWorkspace deletes a workspace
func DeleteWorkspace(c *gin.Context) {
	workspaceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}

	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to delete this workspace", utils.ErrForbidden, nil)
		return
	}

	if workspaceRole != models.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to delete this workspace", utils.ErrForbidden, nil)
		return
	}

	// Delete the workspace (only admins can delete)
	err = queries.DeleteWorkspace(workspaceID, userID.(uint64))
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to delete workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace deleted successfully", nil, nil)
}
