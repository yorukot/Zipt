package shortener

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
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
	ShortCode   string     `json:"short_code" binding:"omitempty,max=100"`
	ExpiresAt   *time.Time `json:"expires_at" binding:"omitempty"`
	DomainID    *uint64    `json:"domain_id,omitempty"`
}

// ShortenURLResponse represents the response after creating a short URL
type ShortenURLResponse struct {
	ShortCode   string     `json:"short_code"`
	OriginalURL string     `json:"original_url"`
	ShortURL    string     `json:"short_url"`
	DomainID    uint64     `json:"domain_id,omitempty"`
	DomainName  string     `json:"domain_name,omitempty"`
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
		return
	}

	// Get user ID if authenticated
	var userIDPtr *uint64
	if userID, exists := c.Get("userID"); exists {
		id := userID.(uint64)
		userIDPtr = &id
	}

	// Get workspace ID if authenticated
	var workspaceIDPtr *uint64
	if workspaceID, exists := c.Get("workspaceID"); exists {
		id := workspaceID.(uint64)
		workspaceIDPtr = &id
	}

	urlModel := createURLModel(request, shortCode, workspaceIDPtr, userIDPtr)

	if err := saveURLToDatabase(c, urlModel); err != nil {
		return
	}

	// Get domain info if a domain ID was provided
	var domainName string
	if urlModel.DomainID > 0 {
		domain, result := queries.GetDomainByID(urlModel.DomainID)
		if result.Error == nil && domain.Verified {
			domainName = domain.Domain
		}
	}

	// Construct the full short URL using the utility function
	shortURL := utils.GetFullShortURL(domainName, shortCode)

	// Get normalized domain name for response
	normalizedDomain, _ := utils.NormalizeDomainName(domainName)

	response := ShortenURLResponse{
		ShortCode:   shortCode,
		OriginalURL: request.OriginalURL,
		ShortURL:    shortURL,
		DomainID:    urlModel.DomainID,
		DomainName:  normalizedDomain,
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

	// Validate custom slug if present
	if request.ShortCode != "" {
		_, exists := c.Get("userID")
		if !exists {
			utils.FullyResponse(c, http.StatusUnauthorized, "custom slugs require authentication", utils.ErrUnauthorized, nil)
			return nil, errors.New("custom slugs require authentication")
		}

		if !isValidCustomSlug(request.ShortCode) {
			errMsg := "custom slug must contain only alphanumeric characters and hyphens, and cannot start or end with a hyphen"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}

		// Check if the slug already exists in the database
		exists, err := checkSlugExists(request.ShortCode, request.DomainID)
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

	// Validate domain ID if provided
	if request.DomainID != nil && *request.DomainID > 0 {
		// Check if domain exists and is verified
		domain, result := queries.GetDomainByID(*request.DomainID)
		if result.Error != nil {
			errMsg := "invalid domain ID"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}

		// Ensure domain is verified
		if !domain.Verified {
			errMsg := "domain has not been verified yet"
			utils.FullyResponse(c, http.StatusBadRequest, errMsg, utils.ErrBadRequest, nil)
			return nil, errors.New(errMsg)
		}

		// Check if user has permission for this domain
		_, userExists := c.Get("userID")
		workspaceID, workspaceExists := c.Get("workspaceID")

		if !userExists {
			errMsg := "authentication required to use custom domains"
			utils.FullyResponse(c, http.StatusUnauthorized, errMsg, utils.ErrUnauthorized, nil)
			return nil, errors.New(errMsg)
		}

		// If domain belongs to a workspace, ensure user has access
		if domain.WorkspaceID != nil && workspaceExists && *domain.WorkspaceID != workspaceID.(uint64) {
			errMsg := "you don't have permission to use this domain"
			utils.FullyResponse(c, http.StatusForbidden, errMsg, utils.ErrForbidden, nil)
			return nil, errors.New(errMsg)
		}
	}

	return &request, nil
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
func checkSlugExists(slug string, domainID *uint64) (bool, error) {
	if domainID == nil {
		// Check for default domain (where domainID = 0)
		return queries.CheckShortCodeExistsByDomain(slug, 0)
	}
	// Check for specific domain
	return queries.CheckShortCodeExistsByDomain(slug, *domainID)
}

// createURLModel creates a new URL model with the request data
func createURLModel(request *ShortenURLRequest, shortCode string, workspaceID *uint64, userID *uint64) models.URL {
	return models.URL{
		ID:          encryption.GenerateID(),
		WorkspaceID: workspaceID,
		DomainID:    getDomainID(request.DomainID),
		OriginalURL: request.OriginalURL,
		ShortCode:   shortCode,
		ExpiresAt:   request.ExpiresAt,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		TotalClick:  0,
	}
}

// getDomainID returns 0 if domainID is nil, otherwise returns the value
func getDomainID(domainID *uint64) uint64 {
	if domainID == nil {
		return 0
	}
	return *domainID
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
