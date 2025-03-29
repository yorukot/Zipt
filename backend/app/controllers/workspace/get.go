package workspace

import (
	"net/http"
	"strconv"

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

	workspaces, err := queries.GetUserWorkspaces(userID.(uint64))
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get workspaces", utils.ErrGetData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspaces fetched successfully", nil, workspaces)
}

// GetWorkspace returns a single workspace by ID
func GetWorkspace(c *gin.Context) {
	workspaceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
		return
	}

	workspaceRole, exists := c.Get("workspaceRole")
	if !exists {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to access this workspace", utils.ErrForbidden, nil)
		return
	}

	if workspaceRole != queries.RoleOwner && workspaceRole != queries.RoleMember {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to access this workspace", utils.ErrForbidden, nil)
		return
	}

	workspace, err := queries.GetWorkspace(workspaceID)
	if err != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Workspace not found", utils.ErrResourceNotFound, nil)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace fetched successfully", nil, workspace)
}