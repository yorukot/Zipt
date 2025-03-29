# Zipt URL Shortener API Documentation

## Overview

The Zipt URL Shortener API allows you to create short URLs, track their analytics, and manage your shortened links. This API supports both authenticated and unauthenticated access with different privileges.

Base URL: `https://yourdomain.com/api/v1`

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). 

**How to authenticate:**
1. Obtain a JWT token by logging in via the `/auth/login` endpoint
2. Include the token in the `Authorization` header of your requests:
   ```
   Authorization: Bearer your_jwt_token
   ```

### Authentication Endpoints

#### User Registration

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "display_name": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Signup successful",
  "code": null,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "display_name": "John Doe",
      "created_at": "2024-03-01T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid registration data or email already in use
- `500 Internal Server Error`: Server-side error

#### User Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "code": null,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "display_name": "John Doe",
      "created_at": "2024-03-01T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid login credentials format
- `401 Unauthorized`: Incorrect email or password
- `500 Internal Server Error`: Server-side error

#### User Logout

Logs out a user by invalidating their session.

**Endpoint:** `POST /auth/logout`

**Authentication:** None (but requires active session)

**Request Body:** None

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully",
  "code": null
}
```

**Error Responses:**
- `500 Internal Server Error`: Server-side error

#### Change Password

Changes the user's password.

**Endpoint:** `POST /auth/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "current_password": "oldSecurePassword123",
  "new_password": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "code": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid password format or new password same as current
- `401 Unauthorized`: Missing or invalid authentication
- `500 Internal Server Error`: Server-side error

#### Refresh Token

Refreshes an expired JWT token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** Required (Using refresh token)

**Request Headers:**
```
Authorization: Bearer your_refresh_token
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "code": null,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token
- `500 Internal Server Error`: Server-side error

## URL Operations

### Create Short URL

Creates a new shortened URL.

**Endpoint:** `POST /url`

**Authentication:** Optional (Required for custom slugs)

**Request Body:**
```json
{
  "original_url": "https://example.com/very/long/url/that/needs/shortening",
  "custom_slug": "my-custom-code",  // Optional, authenticated users only
  "expires_at": "2024-12-31T23:59:59Z"  // Optional
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Short URL created successfully",
  "code": null,
  "result": {
    "short_code": "abc123",
    "original_url": "https://example.com/very/long/url/that/needs/shortening",
    "short_url": "https://yourdomain.com/abc123",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-03-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid URL or custom slug already in use
- `401 Unauthorized`: Custom slug requested without authentication
- `500 Internal Server Error`: Server-side error

### List User's URLs

Retrieves all URLs created by the authenticated user.

**Endpoint:** `GET /url/list`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "URLs retrieved successfully",
  "code": null,
  "result": {
    "urls": [
      {
        "id": "12345678",
        "original_url": "https://example.com/path/to/resource",
        "short_code": "abc123",
        "click_count": 42,
        "expires_at": "2024-12-31T23:59:59Z",
        "created_at": "2024-03-01T10:30:00Z",
        "updated_at": "2024-03-01T10:30:00Z",
        "user_id": "user_123456"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `500 Internal Server Error`: Server-side error

### Update URL

Updates an existing shortened URL.

**Endpoint:** `PUT /url/:shortCode`

**Authentication:** Required

**Path Parameters:**
- `shortCode`: The short code of the URL to update

**Request Body:**
```json
{
  "original_url": "https://example.com/updated/destination/url",  // Optional
  "custom_slug": "new-custom-slug",  // Optional
  "expires_at": "2024-12-31T23:59:59Z"  // Optional
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "URL updated successfully",
  "code": null,
  "result": {
    "short_code": "new-custom-slug",
    "original_url": "https://example.com/updated/destination/url",
    "short_url": "https://yourdomain.com/new-custom-slug",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-03-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid URL or custom slug already in use
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to update this URL
- `404 Not Found`: URL not found
- `500 Internal Server Error`: Server-side error

### Delete URL

Deletes an existing shortened URL.

**Endpoint:** `DELETE /url/:shortCode`

**Authentication:** Required

**Path Parameters:**
- `shortCode`: The short code of the URL to delete

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "URL deleted successfully",
  "code": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to delete this URL
- `404 Not Found`: URL not found
- `500 Internal Server Error`: Server-side error

### Get URL Analytics

Retrieves analytics data for a specific URL.

**Endpoint:** `GET /url/:workspaceID/:shortCode/analytics`

**Authentication:** Required

**Query Parameters:**
- `days` (optional): Number of days to include in the time range (e.g., `?days=7` for data from the last 7 days)
- `hours` (optional): Number of hours to include in the time range (e.g., `?hours=24` for data from the last 24 hours)
- `mins` (optional): Number of minutes to include in the time range (e.g., `?mins=30` for data from the last 30 minutes)
- `months` (optional): Number of months to include in the time range (e.g., `?months=3` for data from the last 3 months)
- `years` (optional): Number of years to include in the time range (e.g., `?years=1` for data from the last year)

You can combine these parameters to create custom time ranges (e.g., `?months=1&days=15` for data from the last 1 month and 15 days).
If no parameters are provided, data from the last 24 hours will be returned.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "code": null,
  "data": {
    "url": {
      "short_code": "abc123",
      "original_url": "https://example.com/path/to/resource",
      "total_clicks": 42,
      "created_at": "2024-03-01T10:30:00Z",
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "analytics": {
      "total_clicks": 42,
      "top_referrers": [
        {
          "metric_type": "referrer",
          "metric_value": "google.com",
          "click_count": 15
        },
        {
          "metric_type": "referrer",
          "metric_value": "facebook.com",
          "click_count": 10
        }
      ],
      "top_countries": [
        {
          "metric_type": "country",
          "metric_value": "US",
          "click_count": 20
        },
        {
          "metric_type": "country",
          "metric_value": "UK",
          "click_count": 8
        }
      ],
      "top_cities": [
        {
          "metric_type": "city",
          "metric_value": "New York",
          "click_count": 10
        },
        {
          "metric_type": "city",
          "metric_value": "London",
          "click_count": 5
        }
      ],
      "clicks_over_day": [
        {
          "metric_type": "clicks",
          "metric_value": "total",
          "bucket_time": "2024-03-01T10:00:00Z",
          "click_count": 5
        },
        {
          "metric_type": "clicks",
          "metric_value": "total",
          "bucket_time": "2024-03-01T11:00:00Z",
          "click_count": 8
        }
      ],
      "date_range": {
        "start": "2024-02-28T10:30:00Z",
        "end": "2024-03-01T10:30:00Z"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid time range parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: URL belongs to a different user
- `404 Not Found`: URL not found
- `500 Internal Server Error`: Server-side error

### Get Paginated URL Metrics

Retrieves paginated metrics of a specific type for a URL.

**Endpoint:** `GET /url/:workspaceID/:shortCode/metrics`

**Authentication:** Required

**Query Parameters:**
- `type` (optional): Type of metric to retrieve (default: `referrer`). Valid values: `referrer`, `country`, `city`, `clicks`
- `page` (optional): Page number (default: `1`)
- `pageSize` (optional): Number of items per page (default: `10`, max: `100`)

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Metrics retrieved successfully",
  "code": null,
  "data": {
    "url": {
      "short_code": "abc123",
      "original_url": "https://example.com/path/to/resource"
    },
    "metrics": {
      "type": "referrer",
      "data": [
        {
          "metric_type": "referrer",
          "metric_value": "google.com",
          "click_count": 15
        },
        {
          "metric_type": "referrer",
          "metric_value": "facebook.com",
          "click_count": 10
        }
      ],
      "pagination": {
        "page": 1,
        "page_size": 10,
        "offset": 0
      },
      "total_count": 25,
      "total_pages": 3
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid metric type or pagination parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: URL belongs to a different user
- `404 Not Found`: URL not found
- `500 Internal Server Error`: Server-side error

### Redirect to Original URL

Redirects to the original URL associated with the short code.

**Endpoint:** `GET /:shortCode`

**Authentication:** None

**Path Parameters:**
- `shortCode`: The short code of the URL

**Response:**
- `301 Moved Permanently`: Redirects to the original URL
- `404 Not Found`: Short URL not found
- `410 Gone`: Short URL has expired

## Error Format

All API errors follow a standard format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "error_code",
  "data": null
}
```

Common error codes:
- `bad_request`: Invalid request parameters
- `unauthorized`: Authentication required or invalid
- `forbidden`: Not authorized to access the resource
- `resource_not_found`: The requested resource was not found
- `resource_expired`: The requested URL has expired
- `resource_already_exists`: Custom slug already in use
- `error_save_data`: Error saving data to the database
- `error_get_data`: Error retrieving data from the database

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Anonymous users: 10 requests per minute
- Authenticated users: 60 requests per minute

Rate limiting information is included in the response headers:
- `X-RateLimit-Limit`: Maximum number of requests per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current minute
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Client Libraries

We provide official client libraries for:
- JavaScript/TypeScript

## Workspace Operations

### Create Workspace

Creates a new workspace.

**Endpoint:** `POST /workspace`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Workspace"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Workspace created successfully",
  "code": null,
  "data": {
    "id": 12345,
    "name": "My Workspace",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `500 Internal Server Error`: Server-side error

### Get Workspace

Retrieves workspace details.

**Endpoint:** `GET /workspace/:workspaceID`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Workspace retrieved successfully",
  "code": null,
  "data": {
    "id": 12345,
    "name": "My Workspace",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T10:30:00Z",
    "users": [
      {
        "id": 67890,
        "email": "user@example.com",
        "display_name": "John Doe",
        "role": "admin"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to access this workspace
- `404 Not Found`: Workspace not found
- `500 Internal Server Error`: Server-side error

### Update Workspace

Updates workspace details.

**Endpoint:** `PUT /workspace/:workspaceID`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace

**Request Body:**
```json
{
  "name": "Updated Workspace Name"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Workspace updated successfully",
  "code": null,
  "data": {
    "id": 12345,
    "name": "Updated Workspace Name",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T11:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to update this workspace
- `404 Not Found`: Workspace not found
- `500 Internal Server Error`: Server-side error

### Delete Workspace

Deletes a workspace.

**Endpoint:** `DELETE /workspace/:workspaceID`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Workspace deleted successfully",
  "code": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to delete this workspace
- `404 Not Found`: Workspace not found
- `500 Internal Server Error`: Server-side error

### Add User to Workspace

Adds a user to a workspace.

**Endpoint:** `POST /workspace/:workspaceID/users`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace

**Request Body:**
```json
{
  "user_id": 67890
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User added to workspace successfully",
  "code": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid user ID
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to add users to this workspace
- `404 Not Found`: Workspace or user not found
- `500 Internal Server Error`: Server-side error

### Update User Role in Workspace

Updates a user's role in a workspace.

**Endpoint:** `PUT /workspace/:workspaceID/users/:userID`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace
- `userID`: The ID of the user

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User role updated successfully",
  "code": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid role (must be "admin" or "member")
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to update roles in this workspace
- `404 Not Found`: Workspace, user, or user-workspace relationship not found
- `500 Internal Server Error`: Server-side error

### Remove User from Workspace

Removes a user from a workspace.

**Endpoint:** `DELETE /workspace/:workspaceID/users/:userID`

**Authentication:** Required

**Path Parameters:**
- `workspaceID`: The ID of the workspace
- `userID`: The ID of the user

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User removed from workspace successfully",
  "code": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to remove users from this workspace
- `404 Not Found`: Workspace, user, or user-workspace relationship not found
- `500 Internal Server Error`: Server-side error

## Domain Operations

### Add Domain

Adds a new domain to a workspace.

**Endpoint:** `POST /domain`

**Authentication:** Required

**Request Body:**
```json
{
  "domain": "example.com"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Domain added successfully",
  "code": null,
  "data": {
    "id": 12345,
    "workspace_id": 67890,
    "domain": "example.com",
    "verified": false,
    "verify_token": "abcdef123456",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid domain format
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to add domains
- `500 Internal Server Error`: Server-side error

### Get Domain

Retrieves domain details.

**Endpoint:** `GET /domain/:domainID`

**Authentication:** Required

**Path Parameters:**
- `domainID`: The ID of the domain

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Domain retrieved successfully",
  "code": null,
  "data": {
    "id": 12345,
    "workspace_id": 67890,
    "domain": "example.com",
    "verified": true,
    "verified_at": "2024-03-01T11:30:00Z",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T11:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to access this domain
- `404 Not Found`: Domain not found
- `500 Internal Server Error`: Server-side error

### Delete Domain

Deletes a domain from a workspace.

**Endpoint:** `DELETE /domain/:domainID`

**Authentication:** Required

**Path Parameters:**
- `domainID`: The ID of the domain

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Domain deleted successfully",
  "code": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to delete this domain
- `404 Not Found`: Domain not found
- `500 Internal Server Error`: Server-side error

### Verify Domain

Verifies ownership of a domain using a DNS TXT record.

**Endpoint:** `POST /domain/:domainID/verify`

**Authentication:** Required

**Path Parameters:**
- `domainID`: The ID of the domain

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Domain verified successfully",
  "code": null,
  "data": {
    "id": 12345,
    "workspace_id": 67890,
    "domain": "example.com",
    "verified": true,
    "verified_at": "2024-03-01T11:30:00Z",
    "created_at": "2024-03-01T10:30:00Z",
    "updated_at": "2024-03-01T11:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Verification failed (DNS record not found or incorrect)
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to verify this domain
- `404 Not Found`: Domain not found
- `500 Internal Server Error`: Server-side error