package shortener

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
)

// ShortenURLRequest represents the request body for creating a short URL
type ShortenURLRequest struct {
	OriginalURL string     `json:"original_url" binding:"required,url"`
	ShortCode   string     `json:"short_code" binding:"omitempty,max=20"`
	ExpiresAt   *time.Time `json:"expires_at" binding:"omitempty"`
}

// ShortenURLResponse represents the response after creating a short URL
type ShortenURLResponse struct {
	ShortCode   string     `json:"short_code"`
	OriginalURL string     `json:"original_url"`
	ShortURL    string     `json:"short_url"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

// CreateShortURL handles the creation of a new short URL
func CreateShortURL(c *gin.Context) {
	request, err := validateShortenRequest(c)
	if err != nil {
		return // Error response already sent in the validation function
	}

	// Check for custom slug - only allowed for authenticated users
	if request.ShortCode != "" {
		// Get user from context (if authenticated)
		_, exists := c.Get("userID")
		if !exists {
			utils.FullyResponse(c, http.StatusUnauthorized, "custom slugs require authentication", utils.ErrUnauthorized, nil)
			return
		}
	}

	shortCode, err := getShortCode(c, request)
	if err != nil {
		return // Error response already sent in the function
	}

	// Get user ID if authenticated
	var userIDPtr *uint64
	if userID, exists := c.Get("userID"); exists {
		id := userID.(uint64)
		userIDPtr = &id
		fmt.Println("User ID:", id)
	}

	urlModel := createURLModel(request, shortCode, userIDPtr)

	if err := saveURLToDatabase(c, urlModel); err != nil {
		return // Error response already sent in the save function
	}

	// Construct the full short URL
	shortDomain := os.Getenv("SHORT_DOMAIN")
	if shortDomain == "" {
		shortDomain = "http://localhost:8080" // Default for local development
	}
	response := ShortenURLResponse{
		ShortCode:   shortCode,
		OriginalURL: request.OriginalURL,
		ShortURL:    shortDomain + shortCode,
		ExpiresAt:   request.ExpiresAt,
		CreatedAt:   urlModel.CreatedAt,
	}

	utils.FullyResponse(c, http.StatusCreated, "Short URL created successfully", nil, response)
}

// validateShortenRequest validates the incoming URL shortening request
func validateShortenRequest(c *gin.Context) (*ShortenURLRequest, error) {
	var request ShortenURLRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "invalid request", utils.ErrBadRequest, err.Error())
		return nil, err
	}

	// Check if this is the custom endpoint (which already requires auth through middleware)
	isCustomEndpoint := c.FullPath() == "/api/v1/url/custom"

	// For the custom endpoint, a custom slug is required
	if isCustomEndpoint && request.ShortCode == "" {
		errMsg := "custom slug is required for this endpoint"
		utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
		return nil, errors.New(errMsg)
	}

	// Validate custom slug if present
	if request.ShortCode != "" {
		if !isValidCustomSlug(request.ShortCode) {
			errMsg := "custom slug must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}

		// Check if the slug already exists in the database
		exists, err := checkSlugExists(request.ShortCode)
		if err != nil {
			utils.ServerErrorResponse(c, http.StatusInternalServerError, "error checking custom slug", utils.ErrGetData, err)
			return nil, err
		}
		if exists {
			errMsg := "custom slug already in use; please choose a different one"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}
	}

	return &request, nil
}

// isValidCustomSlug checks if a custom slug meets all requirements
func isValidCustomSlug(slug string) bool {
	// Length check (3-20 characters)
	if len(slug) < 3 || len(slug) > 20 {
		return false
	}

	// Regex pattern: allow alphanumeric and hyphens, but no consecutive hyphens
	// and cannot start or end with a hyphen
	pattern := regexp.MustCompile(`^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$`)
	return pattern.MatchString(slug)
}

// getShortCode generates or validates a short code for the URL
func getShortCode(c *gin.Context, request *ShortenURLRequest) (string, error) {
	// If custom slug is provided, check if it's available
	if request.ShortCode != "" {
		return request.ShortCode, nil
	}

	// Generate a random short code
	shortCode, err := generateRandomShortCode(6)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error generating short code", utils.ErrParse, err)
		return "", err
	}

	return shortCode, nil
}

// generateRandomShortCode creates a random string for the URL shortcode
func generateRandomShortCode(length int) (string, error) {
	buffer := make([]byte, length)
	_, err := rand.Read(buffer)
	if err != nil {
		return "", err
	}

	// Convert to base64 and remove non-alphanumeric chars
	shortCode := base64.URLEncoding.EncodeToString(buffer)
	// Truncate to desired length
	if len(shortCode) > length {
		shortCode = shortCode[:length]
	}
	return shortCode, nil
}

// checkSlugExists checks if a custom slug is already in use
func checkSlugExists(slug string) (bool, error) {
	return queries.CheckShortCodeExists(slug)
}

// createURLModel creates a new URL model with the request data
func createURLModel(request *ShortenURLRequest, shortCode string, userID *uint64) models.URL {
	return models.URL{
		ID:          encryption.GenerateID(),
		UserID:      userID,
		OriginalURL: request.OriginalURL,
		ShortCode:   shortCode,
		ExpiresAt:   request.ExpiresAt,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ClickCount:  0,
	}
}

// saveURLToDatabase saves the new URL to the database
func saveURLToDatabase(c *gin.Context, urlModel models.URL) error {
	result := queries.CreateURLQueue(urlModel)
	if result.Error != nil || result.RowsAffected == 0 {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error creating short URL", utils.ErrSaveData, result.Error)
		return result.Error
	}
	return nil
}
