package workspace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// DeleteWorkspace deletes a workspace
func DeleteWorkspace(c *gin.Context) {
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID, ok := workspaceIDAny.(uint64)
	if !ok {
		utils.FullyResponse(c, http.StatusInternalServerError, "Invalid workspace ID type", utils.ErrBadRequest, nil)
		return
	}

	// Get the current user's ID (for logging purposes)
	_, exists = c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User ID not found", utils.ErrUnauthorized, nil)
		return
	}

	// Verify that the user is an owner of the workspace
	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusInternalServerError, "Workspace role not found", utils.ErrGetData, nil)
		return
	}

	// Double-check the role is owner (should already be enforced by middleware, but adding for explicit safety)
	if workspaceRole != models.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "Only workspace owners can delete workspaces", utils.ErrForbidden, nil)
		return
	}

	// Delete the workspace (only owners can delete)
	err := queries.DeleteWorkspaceComplete(workspaceID)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to delete workspace", utils.ErrSaveData, nil)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace deleted successfully", nil, nil)
}
