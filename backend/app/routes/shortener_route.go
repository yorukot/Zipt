package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/shortener"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/pkg/middleware"
)

// ShortenerRoute sets up routes for URL shortener functionality
func ShortenerRoute(r *gin.RouterGroup) {
	// Route to /api/vX/shortcode is handled at root level in main.go

	r.Use(middleware.GetContextUserID())
	// Public routes (anonymous users)
	r.POST("/url", shortener.CreateShortURL)                   // Create short URL (anonymous users without custom slug)
	r.POST("/check-shortcode", shortener.CheckShortCodeExists) // Check if short code exists

	// Protected routes (require authentication)
	protected := r.Group("/url/:workspaceID")
	protected.Use(middleware.CheckWorkspaceRoleAndStore(models.RoleMember))

	// Workspace-specific routes
	protected.POST("", shortener.CreateShortURL)     // Create short URL within workspace
	protected.GET("/list", shortener.GetUserURLs)    // Get all URLs created within workspace
	protected.PUT("/:urlID", shortener.UpdateURL)    // Update an existing URL (authenticated users only)
	protected.DELETE("/:urlID", shortener.DeleteURL) // Delete an existing URL (authenticated users only)

	// URL-specific routes
	analytics := protected.Group("/:urlID/analytics")
	analytics.GET("", shortener.GetURLAnalytics)                 // Get analytics overview
	analytics.GET("/timeseries", shortener.GetURLTimeSeriesData) // Get time series metrics of a specific type
}
