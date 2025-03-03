package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// ChangePasswordRequest represents the request body for changing a password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required,max=128,min=8"`
	NewPassword     string `json:"new_password" binding:"required,max=128,min=8"`
}

// ChangePassword handles the password change process
// This endpoint requires authentication
func ChangePassword(c *gin.Context) {
	// Verify authentication
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Validate the request
	request, err := validateChangePasswordRequest(c)
	if err != nil {
		return // Error response already sent in the validation function
	}

	// Fetch the user
	user, err := fetchUserByID(c, userID.(uint64))
	if err != nil {
		return // Error response already sent in the fetch function
	}

	// Verify the current password
	if err := verifyCurrentPassword(c, user, request.CurrentPassword); err != nil {
		return // Error response already sent in the validation function
	}

	// Update the password
	if err := updateUserPassword(c, user.ID, request.NewPassword); err != nil {
		return // Error response already sent in the update function
	}

	utils.FullyResponse(c, http.StatusOK, "Password changed successfully", nil, nil)
}

// validateChangePasswordRequest validates the incoming password change request
func validateChangePasswordRequest(c *gin.Context) (*ChangePasswordRequest, error) {
	var request ChangePasswordRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return nil, err
	}

	// Check if the new password is different from the current one
	if request.CurrentPassword == request.NewPassword {
		utils.FullyResponse(c, http.StatusBadRequest, "New password must be different from current password", utils.ErrBadRequest, nil)
		return nil, errors.New("new password must be different")
	}

	return &request, nil
}

// fetchUserByID retrieves the user by ID from the database
func fetchUserByID(c *gin.Context, userID uint64) (models.User, error) {
	user, result := queries.GetUserQueueByID(userID)
	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, http.StatusNotFound, "User not found", utils.ErrResourceNotFound, nil)
		return models.User{}, result.Error
	} else if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving user data", utils.ErrGetData, result.Error)
		return models.User{}, result.Error
	}

	return user, nil
}

// verifyCurrentPassword verifies if the provided password matches the stored hash
func verifyCurrentPassword(c *gin.Context, user models.User, password string) error {
	if user.Password == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid password", utils.ErrInvalidPassword, nil)
		return errors.New("invalid password")
	}

	match, err := encryption.ComparePasswordAndHash(password, user.Password)
	if err != nil || !match {
		utils.FullyResponse(c, http.StatusBadRequest, "Current password is incorrect", utils.ErrInvalidPassword, nil)
		return errors.New("invalid password")
	}

	return nil
}

// updateUserPassword updates the user's password in the database
func updateUserPassword(c *gin.Context, userID uint64, newPassword string) error {
	// Hash the new password
	hashedPassword, err := encryption.HashPassword(newPassword)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error hashing password", utils.ErrHashData, err)
		return err
	}

	// Update the password in the database
	result := queries.UpdateUserPassword(userID, hashedPassword)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error updating password", utils.ErrSaveData, result.Error)
		return result.Error
	}

	return nil
}
