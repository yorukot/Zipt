package domain

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// GetDomains returns all domains for a workspace
func GetDomains(c *gin.Context) {
	// Get workspace ID from context (set by middleware)
	workspaceID, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// Get all domains for the workspace
	domains, err := queries.GetDomainsByWorkspaceID(workspaceID.(uint64))
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to get domains", utils.ErrGetData, err)
		return
	}

	// Convert to response format
	var response []DomainResponse
	for _, domain := range domains {
		response = append(response, DomainResponse{
			ID:          domain.ID,
			WorkspaceID: domain.WorkspaceID,
			Domain:      domain.Domain,
			Verified:    domain.Verified,
			VerifyToken: domain.VerifyToken,
			VerifiedAt:  domain.VerifiedAt,
			CreatedAt:   domain.CreatedAt,
			UpdatedAt:   domain.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetDomain returns a single domain by ID
func GetDomain(c *gin.Context) {
	// Get domain ID from parameters
	domainIDStr := c.Param("domainID")
	domainID, err := strconv.ParseUint(domainIDStr, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid domain ID", utils.ErrBadRequest, nil)
		return
	}

	// Get the domain
	domain, result := queries.GetDomainByID(domainID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusNotFound, "Domain not found", utils.ErrResourceNotFound, nil)
		return
	}

	// Ensure the domain belongs to the workspace
	workspaceID, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	// For security, only return the domain if it belongs to the workspace
	if domain.WorkspaceID == nil || *domain.WorkspaceID != workspaceID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to access this domain", utils.ErrForbidden, nil)
		return
	}

	c.JSON(http.StatusOK, &DomainResponse{
		ID:          domain.ID,
		WorkspaceID: domain.WorkspaceID,
		Domain:      domain.Domain,
		Verified:    domain.Verified,
		VerifyToken: domain.VerifyToken,
		VerifiedAt:  domain.VerifiedAt,
		CreatedAt:   domain.CreatedAt,
		UpdatedAt:   domain.UpdatedAt,
	})
}
