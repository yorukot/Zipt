package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&URL{})
	db.GetDB().AutoMigrate(&Domain{})
}

// URL represents a shortened URL in the database
type URL struct {
	ID          uint64     `json:"id" gorm:"primary_key"`
	DomainID    uint64     `json:"domain_id,omitempty" gorm:"index"`
	WorkspaceID *uint64    `json:"workspace_id,omitempty" gorm:"index"`
	OriginalURL string     `json:"original_url" gorm:"not null"`
	ShortCode   string     `json:"short_code" gorm:"not null"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`
	TotalClick  int64      `json:"total_click" gorm:"default:0"`
}

type Domain struct {
	ID          uint64     `json:"id" gorm:"primary_key"`
	WorkspaceID *uint64    `json:"workspace_id,omitempty" gorm:"index"`
	Domain      string     `json:"domain" gorm:"not null"`
	Verified    bool       `json:"verified" gorm:"default:false"`
	VerifyToken string     `json:"verify_token" gorm:"not null"`
	VerifiedAt  *time.Time `json:"verified_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`
}
