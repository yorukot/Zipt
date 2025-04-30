package queries

import (
	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"gorm.io/gorm"
)

// Get user by email
func GetUserQueueByEmail(email string) (user models.User, result *gorm.DB) {
	result = db.GetDB().Where("email = ?", email).First(&user)
	return user, result
}

// Get user by user ID
func GetUserQueueByID(id uint64) (user models.User, result *gorm.DB) {
	result = db.GetDB().Where("id = ?", id).First(&user)
	return user, result
}

// Create new user data
func CreateUserQueue(user models.User) *gorm.DB {
	result := db.GetDB().Create(&user)
	return result
}

// UpdateUserPassword updates a user's password in the database
func UpdateUserPassword(userID uint64, hashedPassword string) *gorm.DB {
	result := db.GetDB().Model(&models.User{}).Where("id = ?", userID).Update("password", hashedPassword)
	return result
}

// UpdateUserEmail updates a user's email in the database
func UpdateUserEmail(userID uint64, email string) *gorm.DB {
	result := db.GetDB().Model(&models.User{}).Where("id = ?", userID).Update("email", email)
	return result
}

// UpdateUserDisplayName updates a user's display name in the database
func UpdateUserDisplayName(userID uint64, displayName string) *gorm.DB {
	result := db.GetDB().Model(&models.User{}).Where("id = ?", userID).Update("display_name", displayName)
	return result
}
