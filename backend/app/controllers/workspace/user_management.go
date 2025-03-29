package workspace

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// AddUser adds a user to a workspace
func AddUser(c *gin.Context) {
	workspaceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
		return
	}

	var req AddUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	userExists, err := queries.CheckUserExists(workspaceID, req.UserID)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to check if user exists", utils.ErrGetData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	if userExists {
		utils.FullyResponse(c, http.StatusBadRequest, "User already exists in workspace", utils.ErrBadRequest, nil)
		return
	}

	// Add the user to the workspace (only admins can add users)
	err = queries.AddUserToWorkspace(workspaceID, req.UserID)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to add user to workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "User added to workspace", nil, nil)
}

// RemoveUser removes a user from a workspace
func RemoveUser(c *gin.Context) {
	workspaceID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
		return
	}

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

	if workspaceRole != queries.RoleOwner {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to remove users from this workspace", utils.ErrForbidden, nil)
		return
	}

	// Remove the user from the workspace (only admins can remove users)
	err = queries.RemoveUserFromWorkspace(workspaceID, targetUserID)
	if err == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, http.StatusNotFound, "User not found in workspace", utils.ErrResourceNotFound, nil)
		return
	}

	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to remove user from workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "User removed from workspace", nil, nil)
}
