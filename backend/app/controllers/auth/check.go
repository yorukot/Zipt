package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/pkg/utils"
)

// Check verifies if a user is currently logged in
func Check(c *gin.Context) {
	// Extract user ID from context (set by auth middleware)
	_, exists := c.Get("userID")

	// If userID doesn't exist in context, user is not logged in
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User is not logged in", utils.ErrUnauthorized, nil)
		return
	}

	// User is logged in, return their basic profile information
	utils.FullyResponse(c, http.StatusOK, "User is logged in", nil, nil)
}
