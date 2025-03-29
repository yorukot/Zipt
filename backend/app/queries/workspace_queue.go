package queries

import (
	"errors"
	"time"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
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

// CreateWorkspace creates a new workspace and assigns the creator as owner
func CreateWorkspace(workspace models.Workspace, userID uint64) (models.Workspace, error) {
	// Create the workspace in a transaction
	tx := db.GetDB().Begin()

	if err := tx.Create(workspace).Error; err != nil {
		tx.Rollback()
		return models.Workspace{}, err
	}

	// Create the workspace user association with owner role
	workspaceUser := &models.WorkspaceUser{
		WorkspaceID: workspace.ID,
		UserID:      userID,
		Role:        RoleOwner,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := tx.Create(workspaceUser).Error; err != nil {
		tx.Rollback()
		return models.Workspace{}, err
	}

	tx.Commit()
	return workspace, nil
}

// GetWorkspace returns a workspace by ID
func GetWorkspace(id uint64) (*models.Workspace, error) {
	var workspace models.Workspace
	if err := db.GetDB().First(&workspace, id).Error; err != nil {
		return nil, err
	}
	return &workspace, nil
}

// GetWorkspaceUsers returns all users in a workspace
func GetWorkspaceUsers(workspaceID uint64) ([]models.WorkspaceUser, error) {
	var users []models.WorkspaceUser
	if err := db.GetDB().Where("workspace_id = ?", workspaceID).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// GetWorkspaceRole returns the role of a user in a workspace
func GetWorkspaceRole(workspaceID, userID uint64) (string, error) {
	var workspaceUser models.WorkspaceUser
	if err := db.GetDB().Where("workspace_id = ? AND user_id = ?", workspaceID, userID).First(&workspaceUser).Error; err != nil {
		return "", err
	}
	return workspaceUser.Role, nil
}

// UpdateWorkspace updates a workspace (only owners can update)
func UpdateWorkspace(workspaceID uint64, name string) error {
	return db.GetDB().Model(&models.Workspace{}).Where("id = ?", workspaceID).Updates(map[string]interface{}{
		"name":       name,
		"updated_at": time.Now(),
	}).Error
}

// DeleteWorkspace deletes a workspace (only owners can delete)
func DeleteWorkspace(workspaceID, userID uint64) error {
	// Delete in a transaction
	tx := db.GetDB().Begin()

	// Delete all workspace users
	if err := tx.Where("workspace_id = ?", workspaceID).Delete(&models.WorkspaceUser{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the workspace
	if err := tx.Delete(&models.Workspace{}, workspaceID).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

// CheckUserExists checks if a user exists in a workspace
func CheckUserExists(workspaceID, userID uint64) (bool, error) {
	var count int64
	if err := db.GetDB().Model(&models.WorkspaceUser{}).Where("workspace_id = ? AND user_id = ?", workspaceID, userID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// AddUserToWorkspace adds a user to a workspace (both owners and members can add users)
func AddUserToWorkspace(workspaceID, targetUserID uint64) error {

	// Add the user to the workspace
	workspaceUser := &models.WorkspaceUser{
		WorkspaceID: workspaceID,
		UserID:      targetUserID,
		Role:        RoleMember,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	return db.GetDB().Create(workspaceUser).Error
}

// UpdateUserWorkspaceRole updates a user's role in a workspace (only owners can update roles)
func UpdateUserWorkspaceRole(workspaceID, userID, targetUserID uint64, newRole string) error {
	// Update the user's role
	return db.GetDB().Model(&models.WorkspaceUser{}).Where("workspace_id = ? AND user_id = ?", workspaceID, targetUserID).
		Updates(map[string]interface{}{
			"role":       newRole,
			"updated_at": time.Now(),
		}).Error
}

// RemoveUserFromWorkspace removes a user from a workspace (only owners can remove users)
func RemoveUserFromWorkspace(workspaceID, targetUserID uint64) error {
	// Remove the user from the workspace
	return db.GetDB().Where("workspace_id = ? AND user_id = ?", workspaceID, targetUserID).Delete(&models.WorkspaceUser{}).Error
}

// GetUserWorkspaces returns all workspaces a user belongs to
func GetUserWorkspaces(userID uint64) ([]models.Workspace, error) {
	var workspaces []models.Workspace
	if err := db.GetDB().Joins("JOIN workspace_users ON workspaces.id = workspace_users.workspace_id").
		Where("workspace_users.user_id = ?", userID).
		Find(&workspaces).Error; err != nil {
		return nil, err
	}
	return workspaces, nil
}
