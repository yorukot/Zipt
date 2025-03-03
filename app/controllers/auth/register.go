package auth

import (
	"fmt"
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

// Register handles the user registration process
func Register(c *gin.Context) {
	request, err := validateSignupRequest(c)
	if err != nil {
		return // Error response already sent in the validation function
	}

	if err := checkEmailAvailability(c, request.Email); err != nil {
		return // Error response already sent in the check function
	}

	fmt.Println("test")

	user := createUserModel(request)

	if err := hashUserPassword(c, &user); err != nil {
		return // Error response already sent in the hash function
	}

	if err := saveUserToQueue(c, user); err != nil {
		return // Error response already sent in the save function
	}
	if err := generateUserSession(c, user.ID); err != nil {
		return // Error response already sent in the session function
	}

	utils.FullyResponse(c, 200, "Signup successful", nil, nil)
}

// validateSignupRequest validates the incoming signup request
func validateSignupRequest(c *gin.Context) (*EmailAuthRequest, error) {
	var request EmailAuthRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, 400, "Invalid request", utils.ErrBadRequest, err.Error())
		return nil, err
	}

	return &request, nil
}

// checkEmailAvailability verifies if the email is already in use
func checkEmailAvailability(c *gin.Context, email string) error {
	_, result := queries.GetUserQueueByEmail(email)
	if result.Error == nil {
		utils.FullyResponse(c, 400, "Email already been used", utils.ErrEmailAlreadyUsed, nil)
		return result.Error
	} else if result.Error != gorm.ErrRecordNotFound {
		utils.ServerErrorResponse(c, 500, "Error checking email", utils.ErrGetData, result.Error)
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
