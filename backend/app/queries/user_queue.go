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
