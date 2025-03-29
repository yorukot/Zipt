package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

// CheckWorkspaceRoleAndStore checks if the user has the specified role in the workspace
// and stores the role in the context for later use
func CheckWorkspaceRoleAndStore() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get workspace ID from URL parameter
		workspaceIDStr := c.Param("workspaceID")
		workspaceID, err := strconv.ParseUint(workspaceIDStr, 10, 64)
		if err != nil {
			utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
			c.Abort()
			return
		}

		// Get user ID from context
		userID, exists := c.Get("userID")
		if !exists {
			utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
			c.Abort()
			return
		}

		// Get user's role in the workspace
		role, err := queries.GetWorkspaceRole(workspaceID, userID.(uint64))
		if err != nil {
			utils.FullyResponse(c, http.StatusForbidden, "You don't have access to this workspace", utils.ErrForbidden, nil)
			c.Abort()
			return
		}

		// Store role in context for use in handlers
		c.Set("workspaceRole", role)

		// Store workspace ID for use in handlers
		c.Set("workspaceID", workspaceID)

		c.Next()
	}
}