package shortener

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
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
	CustomSlug  string     `json:"custom_slug" binding:"omitempty,alphanum,max=20"`
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

	shortCode, err := getShortCode(c, request)
	if err != nil {
		return // Error response already sent in the function
	}

	urlModel := createURLModel(request, shortCode)

	if err := saveURLToDatabase(c, urlModel); err != nil {
		return // Error response already sent in the save function
	}

	// Construct the full short URL
	baseURL := "http://yourdomain.com/" // Replace with your actual domain
	response := ShortenURLResponse{
		ShortCode:   shortCode,
		OriginalURL: request.OriginalURL,
		ShortURL:    baseURL + shortCode,
		ExpiresAt:   request.ExpiresAt,
		CreatedAt:   urlModel.CreatedAt,
	}

	utils.FullyResponse(c, http.StatusCreated, "Short URL created successfully", nil, response)
}

// validateShortenRequest validates the incoming URL shortening request
func validateShortenRequest(c *gin.Context) (*ShortenURLRequest, error) {
	var request ShortenURLRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return nil, err
	}

	return &request, nil
}

// getShortCode generates or validates a short code for the URL
func getShortCode(c *gin.Context, request *ShortenURLRequest) (string, error) {
	// If custom slug is provided, check if it's available
	if request.CustomSlug != "" {
		// Check if the custom slug is already in use
		exists, err := checkSlugExists(request.CustomSlug)
		if err != nil {
			utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error checking custom slug", utils.ErrGetData, err)
			return "", err
		}
		if exists {
			utils.FullyResponse(c, http.StatusBadRequest, "Custom slug already in use", utils.ErrBadRequest, nil)
			return "", err
		}
		return request.CustomSlug, nil
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
func createURLModel(request *ShortenURLRequest, shortCode string) models.URL {
	return models.URL{
		ID:          encryption.GenerateID(),
		OriginalURL: request.OriginalURL,
		ShortCode:   shortCode,
		ExpiresAt:   request.ExpiresAt,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
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
