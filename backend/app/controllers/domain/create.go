package domain

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
)

// CreateDomain handles domain creation for a workspace
func CreateDomain(c *gin.Context) {
	// Get workspace ID from context (set by middleware)
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID, ok := workspaceIDAny.(uint64)
	if !ok {
		utils.FullyResponse(c, http.StatusInternalServerError, "Invalid workspace ID format", utils.ErrParseData, nil)
		return
	}
	var req DomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, nil)
		return
	}

	// Check if domain already exists
	exists, err := queries.CheckDomainExists(req.Domain)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Error checking domain existence", utils.ErrGetData, err)
		return
	}

	if exists {
		utils.FullyResponse(c, http.StatusConflict, "Domain already exists", utils.ErrResourceExists, nil)
		return
	}

	// Generate a verification token
	verifyToken, err := encryption.RandStringRunes(64, false)
	if err != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to generate verification token", utils.ErrSaveData, err)
		return
	}

	// Create the domain
	domain := models.Domain{
		ID:          encryption.GenerateID(),
		WorkspaceID: &workspaceID,
		Domain:      req.Domain,
		Verified:    false,
		VerifyToken: verifyToken,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	newDomain, result := queries.CreateDomain(domain)
	if result.Error != nil {
		utils.ServerErrorResponse(c, http.StatusInternalServerError, "Failed to create domain", utils.ErrSaveData, result.Error)
		return
	}

	// Return the domain
	utils.FullyResponse(c, http.StatusCreated, "Domain created successfully", nil, &DomainResponse{
		ID:          newDomain.ID,
		WorkspaceID: newDomain.WorkspaceID,
		Domain:      newDomain.Domain,
		Verified:    newDomain.Verified,
		VerifyToken: newDomain.VerifyToken,
		CreatedAt:   newDomain.CreatedAt,
		UpdatedAt:   newDomain.UpdatedAt,
	})
}
