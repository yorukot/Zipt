package workspace

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// RemoveUser removes a user from a workspace
func RemoveUser(c *gin.Context) {
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID := workspaceIDAny.(uint64)

	targetUserID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid user ID", utils.ErrBadRequest, nil)
		return
	}

	// Get workspace role from context (set by auth middleware)
	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to remove users from this workspace", utils.ErrForbidden, nil)
		return
	}

	if workspaceRole != models.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to remove users from this workspace", utils.ErrForbidden, nil)
		return
	}

	// Remove the user from the workspace (only owners can remove users)
	result := queries.DeleteWorkspaceUserQueue(workspaceID, targetUserID)
	if result.Error == gorm.ErrRecordNotFound || result.RowsAffected == 0 {
		utils.FullyResponse(c, http.StatusNotFound, "User not found in workspace", utils.ErrResourceNotFound, nil)
		return
	}

	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to remove user from workspace", utils.ErrSaveData, map[string]interface{}{
			"details": result.Error.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "User removed from workspace", nil, nil)
}
