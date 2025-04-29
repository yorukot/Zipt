package shortener

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// GetUserURLs returns all URLs created by the authenticated user
func GetUserURLs(c *gin.Context) {
	// This endpoint should be protected by authentication middleware
	_, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "Authentication required", utils.ErrUnauthorized, nil)
		return
	}

	workspaceID, workspaceExists := c.Get("workspaceID")
	if !workspaceExists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// Get workspace's URLs with domain information preloaded
	urls, err := queries.GetURLsByWorkspaceID(workspaceID.(uint64))
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error retrieving URLs", utils.ErrGetData, err)
		return
	}

	// Enhance URL data with formatted short URLs
	type EnhancedURL struct {
		ID          uint64     `json:"id"`
		ShortCode   string     `json:"short_code"`
		OriginalURL string     `json:"original_url"`
		ShortURL    string     `json:"short_url"`
		DomainID    uint64     `json:"domain_id,omitempty"`
		DomainName  string     `json:"domain_name,omitempty"`
		ExpiresAt   *time.Time `json:"expires_at,omitempty"`
		CreatedAt   time.Time  `json:"created_at"`
		UpdatedAt   time.Time  `json:"updated_at"`
		TotalClicks int64      `json:"total_clicks"`
	}

	enhancedURLs := make([]EnhancedURL, 0, len(urls))

	for _, url := range urls {
		var domainName string
		if url.Domain != nil && url.Domain.Verified {
			domainName = url.Domain.Domain
		}

		// Construct the full short URL
		shortURL := utils.GetFullShortURL(domainName, url.ShortCode)

		// Get normalized domain name for response
		normalizedDomain, _ := utils.NormalizeDomainName(domainName)

		enhancedURLs = append(enhancedURLs, EnhancedURL{
			ID:          url.ID,
			ShortCode:   url.ShortCode,
			OriginalURL: url.OriginalURL,
			ShortURL:    shortURL,
			DomainID:    url.DomainID,
			DomainName:  normalizedDomain,
			ExpiresAt:   url.ExpiresAt,
			CreatedAt:   url.CreatedAt,
			UpdatedAt:   url.UpdatedAt,
			TotalClicks: url.TotalClicks,
		})
	}

	// Return workspace's URLs with enhanced information
	c.JSON(http.StatusOK, enhancedURLs)
}
