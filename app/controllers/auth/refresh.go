package auth

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// RefreshToken handles refreshing the access token using the refresh token
func RefreshToken(c *gin.Context) {
	// Retrieve the refresh token from the cookie
	refreshTokenCookie, err := c.Request.Cookie("refresh_token")
	if err != nil || refreshTokenCookie.Value == "" {
		utils.FullyResponse(c, 401, "Refresh token is required", utils.ErrUnauthorized, nil)
		return
	}

	refreshToken := refreshTokenCookie.Value

	// Validate the refresh token by checking if it exists in the database
	session, err := validateRefreshToken(c, refreshToken)
	if err != nil {
		return // Error response already sent in the validation function
	}

	// Check if the session is expired
	if session.ExpiresAt.Before(time.Now()) {
		// Delete the expired session
		queries.DeleteSessionQueueByID(session.SessionID)

		utils.FullyResponse(c, 401, "Refresh token has expired, please login again", utils.ErrUnauthorized, nil)
		return
	}

	// Generate new tokens (access token and optionally refresh token)
	if err := regenerateTokens(c, session); err != nil {
		return // Error response already sent in the regenerate function
	}

	utils.FullyResponse(c, 200, "Token refreshed successfully", nil, nil)
}

// validateRefreshToken validates the refresh token against the database
func validateRefreshToken(c *gin.Context, refreshToken string) (models.Session, error) {
	session, result := queries.GetSessionQueueBySecretKey(refreshToken)

	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, 401, "Invalid refresh token", utils.ErrUnauthorized, nil)
		return models.Session{}, errors.New("invalid refresh token")
	} else if result.Error != nil {
		utils.ServerErrorResponse(c, 500, "Error validating refresh token", utils.ErrGetData, result.Error)
		return models.Session{}, result.Error
	}

	return session, nil
}

// regenerateTokens generates a new access token and updates the refresh token if needed
func regenerateTokens(c *gin.Context, session models.Session) error {
	// Get current time
	now := time.Now()

	// Generate new access token
	accessTokenExpiresAt := now.Add(time.Minute * time.Duration(utils.CookieAccessTokenExpires))
	accessToken, err := encryption.GenerateNewJwtToken(session.UserID, []string{}, accessTokenExpiresAt)
	if err != nil {
		utils.ServerErrorResponse(c, 500, "Error generating access token", utils.ErrGenerateSession, err)
		return err
	}

	// Set the new access token cookie
	c.SetCookie("access_token", accessToken, utils.CookieAccessTokenExpires*60, "/", "", utils.IsCookieSecure(), false)

	// Optionally refresh the refresh token if it's going to expire soon
	// For example, if it expires in less than 3 days, issue a new one
	refreshTokenThreshold := now.Add(time.Hour * 24 * 3) // 3 days

	if session.ExpiresAt.Before(refreshTokenThreshold) {
		// Generate a new refresh token
		newSession, err := createNewSession(session.UserID)
		if err != nil {
			utils.ServerErrorResponse(c, 500, "Error generating refresh token", utils.ErrGenerateSession, err)
			return err
		}

		// Delete the old session
		queries.DeleteSessionQueueByID(session.SessionID)

		// Set the new refresh token cookie
		c.SetCookie("refresh_token", newSession.SecretKey, utils.CookieRefreshTokenExpires*24*60*60, "", "", utils.IsCookieSecure(), true)
	}

	return nil
}

// createNewSession creates a new session for the user
func createNewSession(userID uint64) (models.Session, error) {
	secretKey, err := encryption.RandStringRunes(1024, true)
	if err != nil {
		return models.Session{}, err
	}

	session := models.Session{
		SessionID: encryption.GenerateID(),
		SecretKey: secretKey,
		UserID:    userID,
		ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(utils.CookieRefreshTokenExpires)),
		CreatedAt: time.Now(),
	}

	// Check if a session with the same secretKey already exists
	for {
		_, result := queries.GetSessionQueueBySecretKey(session.SecretKey)
		if result.Error == gorm.ErrRecordNotFound {
			break
		} else if result.Error != nil {
			// Handle any other errors
			return models.Session{}, result.Error
		}

		secretKey, err = encryption.RandStringRunes(1024, true)
		if err != nil {
			return models.Session{}, err
		}
		session.SecretKey = secretKey
	}

	// Create the new session in the database
	result := queries.CreateSessionQueue(session)
	if result.Error != nil {
		return models.Session{}, result.Error
	}

	return session, nil
}
