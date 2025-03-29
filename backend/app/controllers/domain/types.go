package domain

import "time"

// DomainRequest represents a request to create or update a domain
type DomainRequest struct {
	Domain string `json:"domain" binding:"required,fqdn"`
}

// DomainResponse represents a domain in API responses
type DomainResponse struct {
	ID          uint64     `json:"id"`
	WorkspaceID *uint64    `json:"workspace_id,omitempty"`
	Domain      string     `json:"domain"`
	Verified    bool       `json:"verified"`
	VerifyToken string     `json:"verify_token,omitempty"`
	VerifiedAt  *time.Time `json:"verified_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
