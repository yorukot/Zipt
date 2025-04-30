package user

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// UpdateEmailRequest represents the request body for changing email
type UpdateEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// UpdateDisplayNameRequest represents the request body for changing display name
type UpdateDisplayNameRequest struct {
	DisplayName string `json:"display_name" binding:"required,min=3,max=50"`
}

// UpdateEmail updates the user's email address
func UpdateEmail(c *gin.Context) {
	// Extract user ID from context (set by auth middleware)
	userID, err := extractUserIDFromContext(c)
	if err != nil {
		return // Error already sent in extract function
	}

	// Validate request
	var request UpdateEmailRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return
	}

	// Sanitize email
	email := strings.TrimSpace(strings.ToLower(request.Email))

	// Check if email is already taken
	_, result := queries.GetUserQueueByEmail(email)
	if result.Error == nil {
		// Record found, email already exists
		utils.FullyResponse(c, http.StatusConflict, "Email already in use", utils.ErrEmailAlreadyUsed, nil)
		return
	} else if result.Error != gorm.ErrRecordNotFound {
		// Some other DB error occurred
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error checking email availability", utils.ErrGetData, result.Error)
		return
	}

	// Update email in database
	result = updateUserEmail(userID, email)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to update email", utils.ErrSaveData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Email updated successfully", nil, nil)
}

// UpdateDisplayName updates the user's display name
func UpdateDisplayName(c *gin.Context) {
	// Extract user ID from context (set by auth middleware)
	userID, err := extractUserIDFromContext(c)
	if err != nil {
		return // Error already sent in extract function
	}

	// Validate request
	var request UpdateDisplayNameRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return
	}

	// Sanitize display name
	displayName := strings.TrimSpace(request.DisplayName)

	// Update display name in database
	result := updateUserDisplayName(userID, displayName)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to update display name", utils.ErrSaveData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Display name updated successfully", nil, nil)
}

// updateUserEmail updates a user's email in the database
func updateUserEmail(userID uint64, email string) *gorm.DB {
	result := queries.UpdateUserEmail(userID, email)
	return result
}

// updateUserDisplayName updates a user's display name in the database
func updateUserDisplayName(userID uint64, displayName string) *gorm.DB {
	result := queries.UpdateUserDisplayName(userID, displayName)
	return result
}
