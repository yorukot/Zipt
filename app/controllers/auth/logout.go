package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// Logout handles the user logout process
// It invalidates the current session and clears cookies
func Logout(c *gin.Context) {
	// Get the refresh token from the cookie
	refreshTokenCookie, err := c.Request.Cookie("refresh_token")
	if err != nil || refreshTokenCookie.Value == "" {
		// Already logged out or no valid session
		utils.FullyResponse(c, http.StatusOK, "Already logged out", nil, nil)
		return
	}

	refreshToken := refreshTokenCookie.Value

	// Delete the session from the database
	result := queries.DeleteSessionQueue(refreshToken)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error logging out", utils.ErrSaveData, result.Error)
		return
	}

	// Clear the cookies by setting them with empty values and negative max age
	c.SetCookie("refresh_token", "", -1, "", "", utils.IsCookieSecure(), true)
	c.SetCookie("access_token", "", -1, "/", "", utils.IsCookieSecure(), false)

	utils.FullyResponse(c, http.StatusOK, "Logged out successfully", nil, nil)
}
