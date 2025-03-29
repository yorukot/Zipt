package domain

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/utils"
)

// DeleteDomain handles domain deletion
func DeleteDomain(c *gin.Context) {
	// Get domain ID from parameters
	domainIDStr := c.Param("domainID")
	domainID, err := strconv.ParseUint(domainIDStr, 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid domain ID", utils.ErrBadRequest, nil)
		return
	}

	// Get the domain to check ownership
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

	// For security, only allow deletion if domain belongs to the workspace
	if domain.WorkspaceID == nil || *domain.WorkspaceID != workspaceID.(uint64) {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to delete this domain", utils.ErrForbidden, nil)
		return
	}

	// Get workspace role from context
	workspaceRole, exists := c.Get("workspaceRole")
	if !exists || workspaceRole != "owner" {
		utils.FullyResponse(c, http.StatusForbidden, "Only workspace owners can delete domains", utils.ErrForbidden, nil)
		return
	}

	// Delete the domain
	result = queries.DeleteDomain(domainID)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to delete domain", utils.ErrDeleteData, result.Error)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Domain deleted successfully", nil, nil)
}
