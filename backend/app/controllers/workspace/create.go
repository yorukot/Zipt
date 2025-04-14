package workspace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
)

// CreateWorkspace handles workspace creation
func CreateWorkspace(c *gin.Context) {
	var req WorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	// Get user ID from context (set by auth middleware)
	userIDAny, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}

	userID := userIDAny.(uint64)

	workspace := models.Workspace{
		ID:   encryption.GenerateID(),
		Name: req.Name,
	}

	// Create workspace with owner role for creator
	workspace, err := queries.CreateWorkspaceWithOwner(workspace, userID)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to create workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusCreated, "Workspace created successfully", nil, workspace)
}
