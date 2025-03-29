package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/shortener"
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
	protected.Use(middleware.CheckWorkspaceRoleAndStore())

	protected.GET("/list", shortener.GetUserURLs)                          // Get all URLs created by user
	protected.GET("/:shortCode/analytics", shortener.GetURLAnalytics)      // Get analytics for a URL with time range
	protected.GET("/:shortCode/metrics", shortener.GetPaginatedURLMetrics) // Get paginated metrics of a specific type
	protected.PUT("/:shortCode", shortener.UpdateURL)                      // Update an existing URL (authenticated users only)
	protected.DELETE("/:shortCode", shortener.DeleteURL)                   // Delete an existing URL (authenticated users only)
}
