package models

import (
	"time"
)

// URL represents a shortened URL in the database
type URL struct {
	ID          uint64     `json:"id" gorm:"primary_key"`
	OriginalURL string     `json:"original_url" gorm:"not null"`
	ShortCode   string     `json:"short_code" gorm:"unique;not null"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`
}
