package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&Workspace{}, &WorkspaceUser{})
}

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

// Users data type / table
type Workspace struct {
	ID        uint64    `json:"id,string" gorm:"primaryKey"`
	Name      string    `json:"name" binding:"required"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type WorkspaceUser struct {
	ID          uint64    `json:"id,string" gorm:"primaryKey"`
	WorkspaceID uint64    `json:"workspace_id,string" binding:"required"`
	Role        string    `json:"role" binding:"required"`
	UserID      uint64    `json:"user_id,string" binding:"required"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoUpdateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoCreateTime"`
}
