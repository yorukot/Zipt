package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&User{})
}

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

// Users data type / table
type Workspace struct {
	ID          uint64    `json:"id,string" gorm:"primaryKey" binding:"required"`
	Name        string    `json:"name" binding:"required"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoUpdateTime" binding:"required"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoCreateTime" binding:"required"`
}

type WorkspaceUser struct {
	ID          uint64    `json:"id,string" gorm:"primaryKey" binding:"required"`
	WorkspaceID uint64    `json:"workspace_id,string" binding:"required"`
	Role        string    `json:"role" binding:"required"`
	UserID      uint64    `json:"user_id,string" binding:"required"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoUpdateTime" binding:"required"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoCreateTime" binding:"required"`
}
