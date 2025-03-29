package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/workspace"
	"github.com/yorukot/zipt/pkg/middleware"
)

// WorkspaceRoute sets up routes for workspace functionality
func WorkspaceRoute(r *gin.RouterGroup) {
	// All workspace routes require authentication
	r.Use(middleware.IsAuthorized())

	r.POST("/workspace", workspace.CreateWorkspace) // Create a new workspace
	r.GET("/workspaces", workspace.GetWorkspaces)   // Get all workspaces for current user

	// Routes for specific workspaces
	workspaceRoutes := r.Group("/workspace")
	workspaceRoutes.Use(middleware.CheckWorkspaceRoleAndStore())
	{
		// Basic workspace routes that all workspace members can access
		workspaceRoutes.GET("/:workspaceID", workspace.GetWorkspace) // Get workspace by ID

		// Routes that require owner permission
		workspaceRoutes.PUT("/:workspaceID", workspace.UpdateWorkspace) // Update workspace - only owners can update

		// Routes that require owner permission
		workspaceRoutes.DELETE("/:workspaceID", workspace.DeleteWorkspace) // Delete workspace - only owners can delete

		// User management within workspaces
		userRoutes := workspaceRoutes.Group("/:workspaceID/user")
		{
			// Add users - both owners and members can add users (with role restrictions in the handler)
			userRoutes.POST("", workspace.AddUser)

			// Remove users - only owners can remove users
			userRoutes.DELETE("/:userId", workspace.RemoveUser)
		}
	}
}
