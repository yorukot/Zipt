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
