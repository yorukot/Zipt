package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// EmailAuthRequest represents the request body for signup
type EmailAuthRequest struct {
	DisplayName string `json:"display_name" binding:"required,max=32,min=1"`
	Email       string `json:"email" binding:"required,email,max=320"`
	Password    string `json:"password" binding:"required,max=128,min=8"`
}

// Register handles user registration
func Register(c *gin.Context) {
	// Validate the request
	request, err := validateSignupRequest(c)
	if err != nil {
		return // Error response already sent in the validation function
	}

	// Check if email is available
	if err := checkEmailAvailability(c, request.Email); err != nil {
		return // Error response already sent in the email check function
	}

	// Create a new user model
	user := createUserModel(request)

	// Hash the user's password
	if err := hashUserPassword(c, &user); err != nil {
		return // Error response already sent in the password function
	}

	// Save the user to the database queue
	if err := saveUserToQueue(c, user); err != nil {
		return // Error response already sent in the save function
	}

	// Generate a session for the user
	if err := generateUserSession(c, user.ID); err != nil {
		return // Error response already sent in the session function
	}

	utils.FullyResponse(c, 200, "Signup successful", nil, map[string]interface{}{
		"user_id":      user.ID,
		"email":        user.Email,
		"display_name": user.DisplayName,
	})
}

// validateSignupRequest validates the incoming signup request
func validateSignupRequest(c *gin.Context) (*EmailAuthRequest, error) {
	var request EmailAuthRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		// Provide more specific error messages based on the validation failure
		utils.FullyResponse(c, 400, "Invalid request format", utils.ErrBadRequest, map[string]interface{}{
			"details": err.Error(),
		})
		return nil, err
	}

	// Additional validation can be added here
	request.Email = strings.TrimSpace(strings.ToLower(request.Email))
	request.DisplayName = strings.TrimSpace(request.DisplayName)

	return &request, nil
}

// checkEmailAvailability verifies if the email is already in use
func checkEmailAvailability(c *gin.Context, email string) error {
	_, result := queries.GetUserQueueByEmail(email)
	if result.Error == nil {
		utils.FullyResponse(c, 400, "Email already in use", utils.ErrEmailAlreadyUsed, map[string]interface{}{
			"field": "email",
		})
		return fmt.Errorf("email already in use")
	} else if result.Error != gorm.ErrRecordNotFound {
		utils.ServerErrorResponse(c, 500, "Error checking email availability", utils.ErrGetData, result.Error)
		return result.Error
	}

	return nil
}

// createUserModel creates a new user model with the request data
func createUserModel(request *EmailAuthRequest) models.User {
	return models.User{
		ID:          encryption.GenerateID(),
		DisplayName: request.DisplayName, // Using DisplayName as Username based on the model
		Email:       request.Email,
		Password:    request.Password,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// hashUserPassword hashes the user's password for secure storage
func hashUserPassword(c *gin.Context, user *models.User) error {
	hashedPassword, err := encryption.HashPassword(user.Password)
	if err != nil {
		utils.ServerErrorResponse(c, 500, "Error hash password", utils.ErrHashData, err)
		return err
	}
	user.Password = hashedPassword
	return nil
}

// saveUserToQueue saves the new user to the user queue
func saveUserToQueue(c *gin.Context, user models.User) error {
	result := queries.CreateUserQueue(user)
	if result.Error != nil || result.RowsAffected == 0 {
		utils.ServerErrorResponse(c, 500, "Error create new user", utils.ErrSaveData, result.Error)
		return result.Error
	}
	return nil
}

// generateUserSession creates a session for the newly registered user
func generateUserSession(c *gin.Context, userID uint64) error {
	err := utils.GenerateUserSession(c, userID)
	if err != nil {
		utils.ServerErrorResponse(c, 500, "Error generate user session", utils.ErrGenerateSession, err)
		return err
	}
	return nil
}
