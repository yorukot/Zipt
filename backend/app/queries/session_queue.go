package queries

import (
	"github.com/yorukot/zipt/app/models"
	db "github.com/yorukot/zipt/pkg/database"
	"gorm.io/gorm"
)

// Create new session
func CreateSessionQueue(session models.Session) *gorm.DB {
	// Create a new session record in the database
	result := db.GetDB().Create(&session)
	return result
}

// Get session by secretKey
func GetSessionQueueBySecretKey(secretKey string) (models.Session, *gorm.DB) {
	var session models.Session
	// Query the session by secretKey
	result := db.GetDB().Where("secret_key = ?", secretKey).First(&session)
	return session, result
}

// Delete session by secretKey
func DeleteSessionQueue(secretKey string) *gorm.DB {
	// Delete session by secretKey
	result := db.GetDB().Where("secret_key = ?", secretKey).Delete(&models.Session{})
	return result
}

// Delete session by ID
func DeleteSessionQueueByID(sessionID uint64) *gorm.DB {
	// Delete session by ID
	result := db.GetDB().Where("session_id = ?", sessionID).Delete(&models.Session{})
	return result
}
