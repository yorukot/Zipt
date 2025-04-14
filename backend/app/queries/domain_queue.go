package queries

import (
	"time"

	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"github.com/yorukot/zipt/pkg/logger"
	"gorm.io/gorm"
)

// CreateDomain creates a new domain record in the database
func CreateDomain(domain models.Domain) (*models.Domain, *gorm.DB) {
	result := db.GetDB().Create(&domain)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to create domain: %v", result.Error)
		return nil, result
	}
	return &domain, result
}

// GetDomainByID retrieves a domain by its ID
func GetDomainByID(id uint64) (*models.Domain, *gorm.DB) {
	var domain models.Domain
	result := db.GetDB().Where("id = ?", id).First(&domain)
	if result.Error != nil {
		return nil, result
	}
	return &domain, result
}

// GetDomainByName retrieves a domain by its name
func GetDomainByName(domainName string) (*models.Domain, *gorm.DB) {
	var domain models.Domain
	result := db.GetDB().Where("domain = ?", domainName).First(&domain)
	if result.Error != nil {
		return nil, result
	}
	return &domain, result
}

// UpdateDomain updates an existing domain
func UpdateDomain(domain models.Domain) *gorm.DB {
	// Update the updated_at timestamp
	domain.UpdatedAt = time.Now()

	// Update the domain in the database
	result := db.GetDB().Save(&domain)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to update domain: %v", result.Error)
	}
	return result
}

// DeleteDomain deletes a domain by ID
func DeleteDomain(id uint64) *gorm.DB {
	result := db.GetDB().Delete(&models.Domain{}, id)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to delete domain: %v", result.Error)
	}
	return result
}

// GetDomainsByWorkspaceID gets all domains for a specific workspace
func GetDomainsByWorkspaceID(workspaceID uint64) ([]models.Domain, error) {
	var domains []models.Domain
	result := db.GetDB().Where("workspace_id = ?", workspaceID).Find(&domains)
	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to get domains for workspace %d: %v", workspaceID, result.Error)
		return nil, result.Error
	}
	return domains, nil
}

// VerifyDomain marks a domain as verified
func VerifyDomain(id uint64) *gorm.DB {
	now := time.Now()
	result := db.GetDB().Model(&models.Domain{}).Where("id = ?", id).Updates(map[string]interface{}{
		"verified":    true,
		"verified_at": now,
		"updated_at":  now,
	})

	if result.Error != nil {
		logger.Log.Sugar().Errorf("Failed to verify domain %d: %v", id, result.Error)
	}
	return result
}

// CheckDomainExists checks if a domain name is already registered
func CheckDomainExists(domainName string) (bool, error) {
	var count int64
	result := db.GetDB().Model(&models.Domain{}).Where("domain = ?", domainName).Count(&count)
	return count > 0, result.Error
}
