package shortener

import (
	"errors"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/utils"
)

// UpdateURLRequest represents the request body for updating a short URL
type UpdateURLRequest struct {
	OriginalURL string     `json:"original_url" binding:"omitempty,url"`
	CustomSlug  string     `json:"custom_slug" binding:"omitempty,max=20"`
	ExpiresAt   *time.Time `json:"expires_at" binding:"omitempty"`
}

// UpdateURL handles updating an existing shortened URL
// This endpoint requires authentication
func UpdateURL(c *gin.Context) {
	// Verify authentication
	userID, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	// Get the URL ID from the route parameter
	shortCode := c.Param("shortCode")
	if shortCode == "" {
		utils.FullyResponse(c, http.StatusBadRequest, "Short code is required", utils.ErrBadRequest, nil)
		return
	}

	// Get the URL from database
	url, result := queries.GetURLQueueByShortCode(shortCode)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Short URL not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Verify ownership - only the URL owner can update it
	if url.UserID == nil || *url.UserID != userID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this URL", utils.ErrForbidden, nil)
		return
	}

	// Parse and validate request
	request, err := validateUpdateRequest(c, url.ShortCode)
	if err != nil {
		return // Error response already sent in validateUpdateRequest
	}

	// Apply updates to the URL model
	updated := applyUpdates(url, request)

	// Save the updated URL
	if err := saveUpdatedURL(c, updated); err != nil {
		return // Error response already sent in saveUpdatedURL
	}

	// Construct the full short URL for the response
	baseURL := os.Getenv("SHORT_DOMAIN")
	if baseURL == "" {
		baseURL = "http://localhost:8080/" // Default for local development
	}
	response := ShortenURLResponse{
		ShortCode:   updated.ShortCode,
		OriginalURL: updated.OriginalURL,
		ShortURL:    baseURL + updated.ShortCode,
		ExpiresAt:   updated.ExpiresAt,
		CreatedAt:   updated.CreatedAt,
	}

	utils.FullyResponse(c, http.StatusOK, "URL updated successfully", nil, response)
}

// validateUpdateRequest validates the update request
func validateUpdateRequest(c *gin.Context, urlShortCode string) (*UpdateURLRequest, error) {
	var request UpdateURLRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return nil, err
	}

	// Ensure at least one field is being updated
	if request.OriginalURL == "" && request.CustomSlug == "" && request.ExpiresAt == nil {
		errMsg := "no fields to update were provided"
		utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
		return nil, errors.New(errMsg)
	}

	// Validate custom slug if present
	if request.CustomSlug != "" && request.CustomSlug != urlShortCode {
		if !isValidCustomSlug(request.CustomSlug) {
			errMsg := "custom slug must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}

		// Check if the slug already exists in the database
		exists, err := checkSlugExists(request.CustomSlug)
		if err != nil {
			utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error checking custom slug", utils.ErrGetData, err)
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

// applyUpdates applies the requested updates to the URL model
func applyUpdates(url models.URL, request *UpdateURLRequest) models.URL {
	// Only update fields that were provided in the request
	if request.OriginalURL != "" {
		url.OriginalURL = request.OriginalURL
	}

	if request.CustomSlug != "" && request.CustomSlug != url.ShortCode {
		url.ShortCode = request.CustomSlug
	}

	if request.ExpiresAt != nil {
		url.ExpiresAt = request.ExpiresAt
	}

	// Always update the UpdatedAt timestamp
	url.UpdatedAt = time.Now()

	return url
}

// saveUpdatedURL saves the updated URL to the database
func saveUpdatedURL(c *gin.Context, url models.URL) error {
	// Use the database directly since there's no UpdateURL function in queries
	result := db.GetDB().Save(&url)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error updating URL", utils.ErrSaveData, result.Error)
		return result.Error
	}
	return nil
}
