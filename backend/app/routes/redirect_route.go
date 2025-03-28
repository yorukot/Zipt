package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/controllers/shortener"
)

// RedirectRoute handles shortcode redirects at the root level
func RedirectRoute(c *gin.Context) {
	// Delegate to the actual redirect handler
	shortener.RedirectURL(c)
}
