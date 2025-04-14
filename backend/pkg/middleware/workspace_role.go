package middleware

import (
	"net/http"
	"strconv"
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

// HasMinimumRole checks if the user's role meets the minimum required role
func HasMinimumRole(userRole, minimumRole string) bool {
	if userRole == queries.RoleOwner {
		return true
	}

	if userRole == queries.RoleMember && minimumRole == queries.RoleMember {
		return true
	}

	return false
}

// CheckWorkspaceRoleAndStore checks if the user has the specified role in the workspace
// and stores the role in the context for later use
func CheckWorkspaceRoleAndStore(minimumRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			utils.FullyResponse(c, http.StatusUnauthorized, "You must be logged in", utils.ErrUnauthorized, nil)
			c.Abort()
			return
		}

		workspaceIDAny, exists := c.Params.Get("workspaceID")
		if !exists {
			utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
			c.Abort()
			return
		}
		
		// Convert string IDs to uint64
		workspaceID, err := strconv.ParseUint(workspaceIDAny, 10, 64)
		if err != nil {
			utils.FullyResponse(c, http.StatusBadRequest, "Invalid workspace ID", utils.ErrBadRequest, nil)
			c.Abort()
			return
		}

		// userID is already uint64, no need to convert
		userIDUint := userID.(uint64)

		// Get user's role in workspace
		workspaceUser, result := queries.GetWorkspaceUserQueue(workspaceID, userIDUint)

		// If record not found, user doesn't have access to workspace
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				utils.FullyResponse(c, http.StatusForbidden, "You don't have access to this workspace", utils.ErrForbidden, nil)
				c.Abort()
				return
			}

			// Other error occurred
			utils.FullyResponse(c, http.StatusInternalServerError, "Error checking workspace access", utils.ErrGetData, nil)
			c.Abort()
			return
		}

		// Store role in context
		c.Set("workspaceRole", workspaceUser.Role)

		// Store workspace ID for use in handlers
		c.Set("workspaceID", workspaceID)

		// Check if user has required role
		if !HasMinimumRole(workspaceUser.Role, minimumRole) {
			utils.FullyResponse(c, http.StatusForbidden, "You don't have required permissions", utils.ErrForbidden, nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
