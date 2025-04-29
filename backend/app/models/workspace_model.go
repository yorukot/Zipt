package models

import (
	"time"

	db "github.com/yorukot/zipt/pkg/database"
)

func init() {
	db.GetDB().AutoMigrate(&Workspace{}, &WorkspaceUser{}, &WorkspaceInvitation{})
}

// Workspace roles
const (
	RoleOwner  = "owner"
	RoleMember = "member"
)

// Invitation statuses
const (
	StatusPending  = "pending"
	StatusAccepted = "accepted"
	StatusRejected = "rejected"
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
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// WorkspaceInvitation represents an invitation to join a workspace
type WorkspaceInvitation struct {
	ID          uint64    `json:"id,string" gorm:"primaryKey"`
	WorkspaceID uint64    `json:"workspace_id,string" binding:"required"`
	UserID      uint64    `json:"user_id,string" binding:"required"`
	InviterID   uint64    `json:"inviter_id,string" binding:"required"`
	Status      string    `json:"status" binding:"required"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Foreign key relationships
	Workspace Workspace `json:"workspace" gorm:"foreignKey:WorkspaceID"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
}
