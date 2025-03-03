package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/shortener"
	"github.com/yorukot/zipt/pkg/middleware"
)

// ShortenerRoute sets up routes for URL shortener functionality
func ShortenerRoute(r *gin.RouterGroup) {
	// Public routes
	r.GET("/:shortCode", shortener.RedirectURL) // Redirect to original URL (direct with shortcode)

	r.Use(middleware.GetContextUserID())

	r.POST("/url", shortener.CreateShortURL) // Create short URL (anonymous users without custom slug)

	// Protected routes (require authentication)
	protected := r.Group("/url")

	protected.GET("/list", shortener.GetUserURLs)                     // Get all URLs created by user
	protected.GET("/:shortCode/analytics", shortener.GetURLAnalytics) // Get analytics for a URL
	protected.PUT("/:shortCode", shortener.UpdateURL)                 // Update an existing URL (authenticated users only)
	protected.DELETE("/:shortCode", shortener.DeleteURL)              // Delete an existing URL (authenticated users only)
}
