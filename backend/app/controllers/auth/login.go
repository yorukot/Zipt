package auth

import (
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// EmailLoginRequest represents the request body for login
type EmailLoginRequest struct {
	Email    string `json:"email" binding:"email,max=320"`
	Password string `json:"password" binding:"required,max=128,min=8"`
}

// Login handles the user login process
func Login(c *gin.Context) {
	request, err := validateLoginRequest(c)
	if err != nil {
		return // Error response already sent in the validation function
	}

	user, err := fetchUserByEmail(c, request.Email)
	if err != nil {
		return // Error response already sent in the fetch function
	}

	if err := validateUserPassword(c, user, request.Password); err != nil {
		return // Error response already sent in the validation function
	}

	if err := generateUserSession(c, user.ID); err != nil {
		return // Error response already sent in the session function
	}

	// Return user information with success response
	utils.FullyResponse(c, 200, "Login successful", nil, map[string]interface{}{
		"user_id":      user.ID,
		"email":        user.Email,
		"display_name": user.DisplayName,
	})
}

// validateLoginRequest validates the incoming login request
func validateLoginRequest(c *gin.Context) (*EmailLoginRequest, error) {
	var request EmailLoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		// Provide more specific error messages based on validation failure
		if strings.Contains(err.Error(), "Email") {
			utils.FullyResponse(c, 400, "Invalid email format", utils.ErrBadRequest, nil)
		} else if strings.Contains(err.Error(), "Password") {
			utils.FullyResponse(c, 400, "Password must be at least 8 characters", utils.ErrBadRequest, nil)
		} else {
			utils.FullyResponse(c, 400, "Invalid request format", utils.ErrBadRequest, nil)
		}
		return nil, err
	}

	// Sanitize inputs
	request.Email = strings.TrimSpace(strings.ToLower(request.Email))

	return &request, nil
}

// fetchUserByEmail retrieves the user by email from the database
func fetchUserByEmail(c *gin.Context, email string) (models.User, error) {
	user, result := queries.GetUserQueueByEmail(email)
	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, 401, "Invalid email or password", utils.ErrInvalidUsernameOrEmail, nil)
		return models.User{}, result.Error
	} else if result.Error != nil {
		utils.ServerErrorResponse(c, 500, "Error checking email", utils.ErrGetData, result.Error)
		return models.User{}, result.Error
	}

	return user, nil
}

// validateUserPassword verifies if the provided password matches the stored hash
func validateUserPassword(c *gin.Context, user models.User, password string) error {
	if user.Password == "" {
		utils.FullyResponse(c, 401, "Invalid email or password", utils.ErrInvalidPassword, nil)
		return errors.New("invalid password")
	}

	match, err := encryption.ComparePasswordAndHash(password, user.Password)
	if err != nil || !match {
		utils.FullyResponse(c, 401, "Invalid email or password", utils.ErrInvalidPassword, map[string]interface{}{
			"field": "password",
			"error": "invalid_credentials",
		})
		return errors.New("invalid password")
	}

	return nil
}
