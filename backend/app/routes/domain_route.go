package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/domain"
	"github.com/yorukot/zipt/pkg/middleware"
)

// DomainRoute sets up routes for domain functionality
func DomainRoute(r *gin.RouterGroup) {
	// All domain routes require authentication and workspace membership
	// /api/v1/workspace/:workspaceID/domain
	domainRoutes := r.Group("/workspace/:workspaceID/domain")
	domainRoutes.Use(middleware.CheckWorkspaceRoleAndStore())
	{
		// Get all domains for a workspace
		domainRoutes.GET("", domain.GetDomains)

		// Create a new domain for a workspace
		domainRoutes.POST("", domain.CreateDomain)

		// Get a specific domain
		domainRoutes.GET("/:domainID", domain.GetDomain)

		// Delete a domain (only workspace owners)
		domainRoutes.DELETE("/:domainID", domain.DeleteDomain)

		// Verify a domain
		domainRoutes.POST("/:domainID/verify", domain.VerifyDomain)
	}
}
