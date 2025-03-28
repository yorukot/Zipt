package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&URL{})
}

// URL represents a shortened URL in the database
type URL struct {
	ID          uint64     `json:"id" gorm:"primary_key"`
	UserID      *uint64    `json:"user_id,omitempty" gorm:"index"`
	User        *User      `json:"-" gorm:"foreignKey:UserID"`
	OriginalURL string     `json:"original_url" gorm:"not null"`
	ShortCode   string     `json:"short_code" gorm:"unique;not null"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`
	ClickCount  int64      `json:"click_count" gorm:"-"` // Field for joined click count data
}