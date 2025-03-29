package shortener

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/pkg/utils"
)

// CheckShortCodeRequest represents the request body for checking a short code
type CheckShortCodeRequest struct {
	ShortCode string  `json:"short_code" binding:"required"`
	DomainID  *uint64 `json:"domain_id,omitempty"`
}

// CheckShortCodeResponse represents the response for the short code check
type CheckShortCodeResponse struct {
	Exists bool `json:"exists"`
}

// CheckShortCodeExists handles checking if a short code is already in use
func CheckShortCodeExists(c *gin.Context) {
	var request CheckShortCodeRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request", utils.ErrBadRequest, err.Error())
		return
	}

	// Validate the short code format
	if !isValidCustomSlug(request.ShortCode) {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid short code format", utils.ErrBadRequest, nil)
		return
	}

	// Check if the short code exists
	exists, err := checkSlugExists(request.ShortCode, request.DomainID)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error checking short code", utils.ErrGetData, err)
		return
	}

	// Return the result
	response := CheckShortCodeResponse{
		Exists: exists,
	}

	utils.FullyResponse(c, http.StatusOK, "Short code availability checked", nil, response)
}
