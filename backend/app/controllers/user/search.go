package user

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// UserSearchResponse represents the response for a user search
type UserSearchResponse struct {
	ID          uint64  `json:"id,string"`
	DisplayName string  `json:"display_name"`
	Email       string  `json:"email"`
	Avatar      *string `json:"avatar,omitempty"`
}

// SearchByEmail searches for a user by their email address
func SearchByEmail(c *gin.Context) {
	// Get user ID from context (current logged-in user)
	currentUserID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}

	// Get email from query parameter
	email := c.Query("email")
	if email == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Email is required", utils.ErrBadRequest, nil)
		return
	}

	// Sanitize email
	email = strings.TrimSpace(strings.ToLower(email))

	// Find user by email
	user, result := queries.GetUserQueueByEmail(email)
	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, http.StatusNotFound, "User not found", utils.ErrResourceNotFound, nil)
		return
	} else if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error searching for user", utils.ErrGetData, result.Error)
		return
	}

	// Check if the user found is the same as the current user
	if user.ID == currentUserID {
		utils.FullyResponse(c, http.StatusBadRequest, "You cannot invite yourself", utils.ErrBadRequest, nil)
		return
	}

	// Create response object (we don't want to expose password)
	response := UserSearchResponse{
		ID:          user.ID,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		Avatar:      user.Avatar,
	}

	utils.FullyResponse(c, http.StatusOK, "User found", nil, response)
}
