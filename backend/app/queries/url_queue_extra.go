package queries

import (
	"time"

	"gorm.io/gorm"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
)

// UpdateURLQueueById updates an existing URL by its ID
func UpdateURLQueueById(url models.URL) *gorm.DB {
	// Update the updated_at timestamp
	url.UpdatedAt = time.Now()

	// Update the URL in the database
	result := db.GetDB().Save(&url)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to update URL: %v", result.Error)
	}
	return result
}

// DeleteURLQueueById deletes a URL by ID
func DeleteURLQueueById(id uint64) *gorm.DB {
	result := db.GetDB().Delete(&models.URL{}, id)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to delete URL: %v", result.Error)
	}
	return result
}

// GetURLsByWorkspaceQueue gets all URLs for a specific workspace
func GetURLsByWorkspaceQueue(workspaceID uint64, page, limit int) (urls []models.URL, total int64, result *gorm.DB) {
	// Calculate offset
	offset := (page - 1) * limit

	// Get total count
	query := db.GetDB().Model(&models.URL{}).Where("workspace_id = ?", workspaceID)
	result = query.Count(&total)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to count URLs for workspace %d: %v", workspaceID, result.Error)
		return nil, 0, result
	}

	// Get paginated results
	result = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&urls)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to get URLs for workspace %d: %v", workspaceID, result.Error)
		return nil, 0, result
	}

	return urls, total, result
}
