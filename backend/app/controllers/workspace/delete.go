package workspace

import (
	"net/http"

	"github.com/gin-gonic/gin"
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

	workspaceID := workspaceIDAny.(uint64)

	// Delete the workspace (only owners can delete)
	err := queries.DeleteWorkspaceComplete(workspaceID)
	if err != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to delete workspace", utils.ErrSaveData, map[string]interface{}{
			"details": err.Error(),
		})
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Workspace deleted successfully", nil, nil)
}
