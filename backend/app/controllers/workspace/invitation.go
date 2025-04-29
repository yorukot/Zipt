package workspace

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yorukot/zipt/app/models"
	"github.com/yorukot/zipt/app/queries"
	"github.com/yorukot/zipt/pkg/encryption"
	"github.com/yorukot/zipt/pkg/utils"
	"gorm.io/gorm"
)

// InviteUser creates an invitation for a user to join a workspace
// This is the only way to add users to a workspace, as direct addition is not allowed.
// Users must accept the invitation to join the workspace.
func InviteUser(c *gin.Context) {
	// Get workspace ID from context (set by middleware)
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}
	workspaceID := workspaceIDAny.(uint64)

	// Get inviter ID from context (current logged-in user)
	inviterIDAny, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}
	inviterID := inviterIDAny.(uint64)

	// Parse request body
	var req InviteUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, nil)
		return
	}

	// Check if user exists
	_, err := queries.GetUserQueueByID(req.UserID)
	if err.Error != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "User not found", utils.ErrBadRequest, nil)
		return
	}

	// Check if user already exists in the workspace
	userExists, err := queries.CheckWorkspaceUserExists(workspaceID, req.UserID)
	if err.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to check if user exists", utils.ErrGetData, nil)
		return
	}

	if userExists {
		utils.FullyResponse(c, http.StatusBadRequest, "User already exists in workspace", utils.ErrBadRequest, nil)
		return
	}

	// Check if invitation already exists
	invitationExists, err := queries.CheckWorkspaceInvitationExists(workspaceID, req.UserID)
	if err.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to check if invitation exists", utils.ErrGetData, nil)
		return
	}

	if invitationExists {
		utils.FullyResponse(c, http.StatusBadRequest, "Invitation already sent to this user", utils.ErrBadRequest, nil)
		return
	}

	// Create invitation
	invitation := models.WorkspaceInvitation{
		ID:          encryption.GenerateID(),
		WorkspaceID: workspaceID,
		UserID:      req.UserID,
		InviterID:   inviterID,
		Status:      models.StatusPending,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result := queries.CreateWorkspaceInvitation(invitation)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to create invitation", utils.ErrSaveData, nil)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Invitation sent successfully", nil, nil)
}

// GetUserInvitations retrieves all pending invitations for the current user
func GetUserInvitations(c *gin.Context) {
	// Get user ID from context (current logged-in user)
	userIDAny, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}
	userID := userIDAny.(uint64)

	// Get invitations
	invitations, result := queries.GetWorkspaceInvitationsByUserID(userID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get invitations", utils.ErrGetData, nil)
		return
	}

	// Prepare response with additional data
	var response []InvitationResponse
	for _, invitation := range invitations {
		// Get workspace details
		workspace, workspaceResult := queries.GetWorkspaceQueueByID(invitation.WorkspaceID)

		// Get inviter details
		inviter, inviterResult := queries.GetUserQueueByID(invitation.InviterID)

		invitationResponse := InvitationResponse{
			ID:          invitation.ID,
			WorkspaceID: invitation.WorkspaceID,
			UserID:      invitation.UserID,
			InviterID:   invitation.InviterID,
			Status:      invitation.Status,
		}

		// Add workspace name if available
		if workspaceResult.Error == nil {
			invitationResponse.WorkspaceName = workspace.Name
		}

		// Add inviter name if available
		if inviterResult.Error == nil {
			invitationResponse.InviterName = inviter.DisplayName
		}

		response = append(response, invitationResponse)
	}

	c.JSON(http.StatusOK, response)
}

// UpdateInvitation updates the status of an invitation (accept/reject)
func UpdateInvitation(c *gin.Context) {
	// Get the invitation ID from the URL parameter
	invitationID, err := strconv.ParseUint(c.Param("invitationID"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid invitation ID", utils.ErrBadRequest, nil)
		return
	}

	// Get user ID from context (current logged-in user)
	userIDAny, exists := c.Get("userID")
	if !exists {
		utils.FullyResponse(c, http.StatusUnauthorized, "User not authenticated", utils.ErrUnauthorized, nil)
		return
	}
	userID := userIDAny.(uint64)

	// Parse request body
	var req UpdateInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid request format", utils.ErrBadRequest, nil)
		return
	}

	// Get the invitation
	invitation, result := queries.GetWorkspaceInvitationByID(invitationID)
	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, http.StatusNotFound, "Invitation not found", utils.ErrResourceNotFound, nil)
		return
	} else if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get invitation", utils.ErrGetData, nil)
		return
	}

	// Check if the invitation belongs to the current user
	if invitation.UserID != userID {
		utils.FullyResponse(c, http.StatusForbidden, "You don't have permission to update this invitation", utils.ErrForbidden, nil)
		return
	}

	// Check if the invitation is still pending
	if invitation.Status != models.StatusPending {
		utils.FullyResponse(c, http.StatusBadRequest, "Invitation has already been processed", utils.ErrBadRequest, nil)
		return
	}

	// If the invitation was accepted, add the user to the workspace
	if req.Status == models.StatusAccepted {
		workspaceUser := models.WorkspaceUser{
			ID:          encryption.GenerateID(),
			WorkspaceID: invitation.WorkspaceID,
			UserID:      invitation.UserID,
			Role:        models.RoleMember,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		result := queries.CreateWorkspaceUserQueue(workspaceUser)
		if result.Error != nil {
			utils.FullyResponse(c, http.StatusInternalServerError, "Failed to add user to workspace", utils.ErrSaveData, nil)
			return
		}
	}

	if req.Status == models.StatusAccepted || req.Status == models.StatusRejected {
		deleteResult := queries.DeleteWorkspaceInvitation(invitationID)
		if deleteResult.Error != nil {
			utils.FullyResponse(c, http.StatusInternalServerError, "Failed to remove invitation", utils.ErrSaveData, nil)
			return
		}
	}

	utils.FullyResponse(c, http.StatusOK, "Invitation "+req.Status+" successfully", nil, nil)
}

// GetWorkspaceInvitations retrieves all pending invitations for a workspace
func GetWorkspaceInvitations(c *gin.Context) {
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}

	workspaceID := workspaceIDAny.(uint64)

	invitations, result := queries.GetWorkspaceInvitationsByWorkspaceID(workspaceID)
	if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get invitations", utils.ErrGetData, nil)
		return
	}

	c.JSON(http.StatusOK, invitations)
}

// RemoveInvitation removes an invitation from a workspace
func RemoveInvitation(c *gin.Context) {
	// Get workspace ID from context (set by middleware)
	workspaceIDAny, exists := c.Get("workspaceID")
	if !exists {
		utils.FullyResponse(c, http.StatusBadRequest, "Workspace ID is required", utils.ErrBadRequest, nil)
		return
	}
	workspaceID := workspaceIDAny.(uint64)

	// Get the invitation ID from the URL parameter
	invitationID, err := strconv.ParseUint(c.Param("invitationID"), 10, 64)
	if err != nil {
		utils.FullyResponse(c, http.StatusBadRequest, "Invalid invitation ID", utils.ErrBadRequest, nil)
		return
	}

	// Get the invitation
	invitation, result := queries.GetWorkspaceInvitationByID(invitationID)
	if result.Error == gorm.ErrRecordNotFound {
		utils.FullyResponse(c, http.StatusNotFound, "Invitation not found", utils.ErrResourceNotFound, nil)
		return
	} else if result.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to get invitation", utils.ErrGetData, nil)
		return
	}

	// Check if the invitation belongs to the workspace
	if invitation.WorkspaceID != workspaceID {
		utils.FullyResponse(c, http.StatusForbidden, "Invitation does not belong to this workspace", utils.ErrForbidden, nil)
		return
	}

	// Delete the invitation
	deleteResult := queries.DeleteWorkspaceInvitation(invitationID)
	if deleteResult.Error != nil {
		utils.FullyResponse(c, http.StatusInternalServerError, "Failed to remove invitation", utils.ErrSaveData, nil)
		return
	}

	utils.FullyResponse(c, http.StatusOK, "Invitation removed successfully", nil, nil)
}
