package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/workspace"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/pkg/middleware"
)

// WorkspaceRoute sets up routes for workspace functionality
func WorkspaceRoute(r *gin.RouterGroup) {
	// All workspace routes require authentication
	r.Use(middleware.IsAuthorized())

	// General workspace endpoints
	r.POST("/workspace", workspace.CreateWorkspace)     // Create a new workspace
	r.GET("/workspaces", workspace.GetWorkspaces)       // Get all workspaces for current user
	r.GET("/invitations", workspace.GetUserInvitations) // Get all invitations for current user

	// Invitation management
	r.PUT("/invitation/:invitationID", workspace.UpdateInvitation) // Accept/reject invitation

	// Group routes by permission level
	memberRoutes := r.Group("/workspace")
	ownerRoutes := r.Group("/workspace")

	// Member routes - require at least member role
	memberRoutes.Use(middleware.CheckWorkspaceRoleAndStore(models.RoleMember))
	memberRoutes.GET("/:workspaceID", workspace.GetWorkspace)                                 // Get workspace details
	memberRoutes.POST("/:workspaceID/invite", workspace.InviteUser)                           // Invite a user to workspace
	memberRoutes.GET("/:workspaceID/invitations", workspace.GetWorkspaceInvitations)          // Get all invitations for a workspace
	memberRoutes.DELETE("/:workspaceID/invitation/:invitationID", workspace.RemoveInvitation) // Remove an invitation
	memberRoutes.GET("/:workspaceID/users", workspace.ListWorkspaceUsers)                     // Get all users in workspace

	// Owner routes - require owner role
	ownerRoutes.Use(middleware.CheckWorkspaceRoleAndStore(models.RoleOwner))
	ownerRoutes.PUT("/:workspaceID", workspace.UpdateWorkspace)            // Update workspace
	ownerRoutes.DELETE("/:workspaceID", workspace.DeleteWorkspace)         // Delete workspace
	ownerRoutes.DELETE("/:workspaceID/user/:userId", workspace.RemoveUser) // Remove users
}
