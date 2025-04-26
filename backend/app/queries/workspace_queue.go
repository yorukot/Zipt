package queries

import (
	"errors"
	"time"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/encryption"
	"gorm.io/gorm"
)

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

var (
	// ErrUnauthorized is returned when the user doesn't have permission to perform an action
	ErrUnauthorized = errors.New("unauthorized action")
)

// CreateWorkspaceQueue creates a new workspace in the database
func CreateWorkspaceQueue(workspace models.Workspace) *gorm.DB {
	result := db.GetDB().Create(&workspace)
	return result
}

// CreateWorkspaceUserQueue creates a new workspace user association
func CreateWorkspaceUserQueue(workspaceUser models.WorkspaceUser) *gorm.DB {
	result := db.GetDB().Create(&workspaceUser)
	return result
}

// GetWorkspaceQueueByID retrieves a workspace by its ID
func GetWorkspaceQueueByID(id uint64) (models.Workspace, *gorm.DB) {
	var workspace models.Workspace
	result := db.GetDB().First(&workspace, id)
	return workspace, result
}

// GetWorkspaceUsersByWorkspaceID retrieves all users in a workspace
func GetWorkspaceUsersByWorkspaceID(workspaceID uint64) ([]models.WorkspaceUser, *gorm.DB) {
	var users []models.WorkspaceUser
	result := db.GetDB().Where("workspace_id = ?", workspaceID).Find(&users)
	return users, result
}

// GetWorkspaceUserQueue retrieves a workspace user association
func GetWorkspaceUserQueue(workspaceID, userID uint64) (models.WorkspaceUser, *gorm.DB) {
	var workspaceUser models.WorkspaceUser
	result := db.GetDB().Where("workspace_id = ? AND user_id = ?", workspaceID, userID).First(&workspaceUser)
	return workspaceUser, result
}

// UpdateWorkspaceQueue updates a workspace
func UpdateWorkspaceQueue(workspace models.Workspace, updates map[string]interface{}) *gorm.DB {
	updates["updated_at"] = time.Now()
	result := db.GetDB().Model(&workspace).Updates(updates)
	return result
}

// DeleteWorkspaceQueue deletes a workspace by its ID
func DeleteWorkspaceQueue(workspaceID uint64) *gorm.DB {
	result := db.GetDB().Delete(&models.Workspace{}, workspaceID)
	return result
}

// DeleteWorkspaceUsersQueue deletes all workspace users by workspace ID
func DeleteWorkspaceUsersQueue(workspaceID uint64) *gorm.DB {
	result := db.GetDB().Where("workspace_id = ?", workspaceID).Delete(&models.WorkspaceUser{})
	return result
}

// CheckWorkspaceUserExists checks if a user exists in a workspace
func CheckWorkspaceUserExists(workspaceID, userID uint64) (bool, *gorm.DB) {
	var count int64
	result := db.GetDB().Model(&models.WorkspaceUser{}).Where("workspace_id = ? AND user_id = ?", workspaceID, userID).Count(&count)
	return count > 0, result
}

// UpdateWorkspaceUserRoleQueue updates a user's role in a workspace
func UpdateWorkspaceUserRoleQueue(workspaceID, userID uint64, role string) *gorm.DB {
	updates := map[string]interface{}{
		"role":       role,
		"updated_at": time.Now(),
	}
	result := db.GetDB().Model(&models.WorkspaceUser{}).Where("workspace_id = ? AND user_id = ?", workspaceID, userID).Updates(updates)
	return result
}

// DeleteWorkspaceUserQueue removes a user from a workspace
func DeleteWorkspaceUserQueue(workspaceID, userID uint64) *gorm.DB {
	result := db.GetDB().Where("workspace_id = ? AND user_id = ?", workspaceID, userID).Delete(&models.WorkspaceUser{})
	return result
}

// GetUserWorkspacesQueue returns all workspaces a user belongs to
func GetUserWorkspacesQueue(userID uint64) ([]models.Workspace, *gorm.DB) {
	var workspaces []models.Workspace
	result := db.GetDB().Joins("JOIN workspace_users ON workspaces.id = workspace_users.workspace_id").
		Where("workspace_users.user_id = ?", userID).
		Find(&workspaces)
	return workspaces, result
}

// CreateWorkspaceWithOwner creates a new workspace and assigns the creator as owner
// This is a helper function that combines multiple queue operations
func CreateWorkspaceWithOwner(workspace models.Workspace, userID uint64) (models.Workspace, error) {
	// Create a copy of the workspace to prevent modifying the original
	workspaceCopy := workspace

	// Create the workspace directly
	result := db.GetDB().Create(&workspaceCopy)
	if result.Error != nil {
		return models.Workspace{}, result.Error
	}

	// Create the workspace user association with owner role
	workspaceUser := &models.WorkspaceUser{
		ID:          encryption.GenerateID(),
		WorkspaceID: workspaceCopy.ID,
		UserID:      userID,
		Role:        RoleOwner,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result = db.GetDB().Create(workspaceUser)
	if result.Error != nil {
		// If creating the user association fails, consider deleting the workspace
		// to maintain consistency, but this is optional based on your requirements
		db.GetDB().Delete(&models.Workspace{}, workspaceCopy.ID)
		return models.Workspace{}, result.Error
	}

	return workspaceCopy, nil
}

// DeleteWorkspaceComplete deletes a workspace and all associated users
// This is a helper function that combines multiple queue operations
func DeleteWorkspaceComplete(workspaceID uint64) error {
	// Delete all workspace users first
	result := db.GetDB().Where("workspace_id = ?", workspaceID).Delete(&models.WorkspaceUser{})
	if result.Error != nil {
		return result.Error
	}

	// Delete the workspace
	result = db.GetDB().Delete(&models.Workspace{}, workspaceID)
	if result.Error != nil {
		return result.Error
	}

	return nil
}

// CreateWorkspaceInvitation creates an invitation to join a workspace
func CreateWorkspaceInvitation(invitation models.WorkspaceInvitation) *gorm.DB {
	result := db.GetDB().Create(&invitation)
	return result
}

// GetWorkspaceInvitationByID retrieves a workspace invitation by its ID
func GetWorkspaceInvitationByID(id uint64) (models.WorkspaceInvitation, *gorm.DB) {
	var invitation models.WorkspaceInvitation
	result := db.GetDB().First(&invitation, id)
	return invitation, result
}

// GetWorkspaceInvitationsByUserID retrieves all workspace invitations for a user
func GetWorkspaceInvitationsByUserID(userID uint64) ([]models.WorkspaceInvitation, *gorm.DB) {
	var invitations []models.WorkspaceInvitation
	result := db.GetDB().Where("user_id = ? AND status = ?", userID, models.StatusPending).Find(&invitations)
	return invitations, result
}

// GetWorkspaceInvitationsByWorkspaceID retrieves all workspace invitations for a workspace
func GetWorkspaceInvitationsByWorkspaceID(workspaceID uint64) ([]models.WorkspaceInvitation, *gorm.DB) {
	var invitations []models.WorkspaceInvitation
	result := db.GetDB().Where("workspace_id = ?", workspaceID).Find(&invitations)
	return invitations, result
}

// UpdateWorkspaceInvitationStatus updates the status of a workspace invitation
func UpdateWorkspaceInvitationStatus(invitationID uint64, status string) *gorm.DB {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	result := db.GetDB().Model(&models.WorkspaceInvitation{}).Where("id = ?", invitationID).Updates(updates)
	return result
}

// CheckWorkspaceInvitationExists checks if a pending invitation exists for a user in a workspace
func CheckWorkspaceInvitationExists(workspaceID, userID uint64) (bool, *gorm.DB) {
	var count int64
	result := db.GetDB().Model(&models.WorkspaceInvitation{}).
		Where("workspace_id = ? AND user_id = ? AND status = ?", workspaceID, userID, models.StatusPending).
		Count(&count)
	return count > 0, result
}

// DeleteWorkspaceInvitation deletes a workspace invitation by its ID
func DeleteWorkspaceInvitation(id uint64) *gorm.DB {
	result := db.GetDB().Delete(&models.WorkspaceInvitation{}, id)
	return result
}
