package workspace

// WorkspaceRequest represents a request to create or update a workspace
type WorkspaceRequest struct {
	Name string `json:"name" binding:"required,max=60"`
}

// AddUserRequest represents a request to add a user to a workspace
type AddUserRequest struct {
	UserID uint64 `json:"user_id" binding:"required"`
}

// UpdateRoleRequest represents a request to update a user's role in a workspace
type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=admin member"`
}

// InviteUserRequest represents a request to invite a user to a workspace
type InviteUserRequest struct {
	UserID uint64 `json:"user_id,string" binding:"required"`
}

// InvitationResponse is a structure returned when fetching invitation details
type InvitationResponse struct {
	ID          uint64 `json:"id,string"`
	WorkspaceID uint64 `json:"workspace_id,string"`
	UserID      uint64 `json:"user_id,string"`
	InviterID   uint64 `json:"inviter_id,string"`
	Status      string `json:"status"`
	// Additional fields for UI display (populated by joins)
	WorkspaceName string `json:"workspace_name,omitempty"`
	InviterName   string `json:"inviter_name,omitempty"`
}

// UpdateInvitationRequest represents a request to update invitation status
type UpdateInvitationRequest struct {
	Status string `json:"status" binding:"required,oneof=accepted rejected"`
}
