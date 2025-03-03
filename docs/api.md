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

Retrieves analytics for a specific shortened URL.

**Endpoint:** `GET /url/:shortCode/analytics`

**Authentication:** Required

**Path Parameters:**
- `shortCode`: The short code of the URL

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "code": null,
  "data": {
    "url": {
      "id": "12345678",
      "original_url": "https://example.com/path/to/resource",
      "short_code": "abc123",
      "click_count": 42,
      "created_at": "2024-03-01T10:30:00Z",
      "updated_at": "2024-03-01T10:30:00Z",
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "analytics": {
      "total_clicks": 42,
      "browsers": [
        {"browser": "Chrome", "count": 28},
        {"browser": "Firefox", "count": 10},
        {"browser": "Safari", "count": 4}
      ],
      "devices": [
        {"device": "Desktop", "count": 30},
        {"device": "Mobile", "count": 10},
        {"device": "Tablet", "count": 2}
      ],
      "referrers": [
        {"referrer": "https://google.com", "count": 15},
        {"referrer": "https://twitter.com", "count": 12},
        {"referrer": "https://facebook.com", "count": 8}
      ],
      "countries": [
        {"country": "US", "count": 20},
        {"country": "DE", "count": 10},
        {"country": "JP", "count": 8}
      ]
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Not authorized to view this URL's analytics
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