package queries

import (
	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"gorm.io/gorm"
)

// CreateURLQueue creates a new URL record in the database
func CreateURLQueue(url models.URL) *gorm.DB {
	result := db.GetDB().Create(&url)
	return result
}

// GetURLQueueByShortCode retrieves a URL by its short code
func GetURLQueueByShortCode(shortCode string) (models.URL, *gorm.DB) {
	var url models.URL
	result := db.GetDB().Where("short_code = ?", shortCode).First(&url)
	return url, result
}

// GetURLQueueByID retrieves a URL by its ID
func GetURLQueueByID(id uint64) (models.URL, *gorm.DB) {
	var url models.URL
	result := db.GetDB().Where("id = ?", id).First(&url)
	return url, result
}

// DeleteURLQueue deletes a URL by its short code
func DeleteURLQueue(shortCode string) *gorm.DB {
	result := db.GetDB().Where("short_code = ?", shortCode).Delete(&models.URL{})
	return result
}

// CheckShortCodeExists checks if a short code is already in use
func CheckShortCodeExists(shortCode string) (bool, error) {
	var count int64
	result := db.GetDB().Model(&models.URL{}).Where("short_code = ?", shortCode).Count(&count)
	return count > 0, result.Error
}

// GetURLsByUserID gets all URLs created by a specific user
func GetURLsByUserID(userID uint64) ([]models.URL, error) {
	var urls []models.URL
	result := db.GetDB().Where("user_id = ?", userID).Order("created_at DESC").Find(&urls)
	return urls, result.Error
}

// GetURLByShortCodeAndDomain retrieves a URL by its short code and domain ID
func GetURLByShortCodeAndDomain(shortCode string, domainID uint64) (models.URL, *gorm.DB) {
	var url models.URL
	result := db.GetDB().Where("short_code = ? AND domain_id = ?", shortCode, domainID).First(&url)
	return url, result
}

// CheckShortCodeExistsByDomain checks if a short code is already in use for a specific domain
func CheckShortCodeExistsByDomain(shortCode string, domainID uint64) (bool, error) {
	var count int64
	result := db.GetDB().Model(&models.URL{}).Where("short_code = ? AND domain_id = ?", shortCode, domainID).Count(&count)
	return count > 0, result.Error
}
