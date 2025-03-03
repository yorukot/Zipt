# Zipt API Documentation

This document provides comprehensive documentation for the Zipt URL Shortener API.

## Base URL

All API endpoints are prefixed with:

```
https://your-domain.com/api/v1
```

Replace `your-domain.com` with your actual domain.

## Date and Time Format

All timestamps in the API use UTC (Coordinated Universal Time) in ISO 8601 format. Timestamps are represented as strings in the format:

```
YYYY-MM-DDThh:mm:ssZ
```

For example: `2023-01-01T12:00:00Z`

When sending dates to the API, always use UTC to ensure consistent behavior across different time zones.

## Authentication

Zipt uses JWT (JSON Web Token) based authentication. Protected endpoints require an `access_token` cookie or an `Authorization` header.

### Authentication Methods

#### Using Cookies (Recommended for Browser Clients)

When you sign up or log in, authentication cookies are automatically set in your browser:
- `access_token`: Short-lived token (15 minutes by default)
- `refresh_token`: Long-lived token (60 days by default) for generating new access tokens

#### Using Authorization Header (Recommended for API Clients)

Include the JWT in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

### Token Refresh

When the access token expires, use the refresh token to get a new one.

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "error_code",
  "data": null
}
```

Common error codes:
- `bad_request`: Invalid request parameters
- `unauthorized`: Authentication required
- `forbidden`: Insufficient permissions
- `resource_not_found`: Requested resource not found
- `resource_gone`: Resource no longer available
- `internal_server_error`: Server-side error

---

## Authentication Endpoints

### Sign Up

Creates a new user account.

**URL**: `/auth/signup`  
**Method**: `POST`  
**Authentication**: None  

#### Request Body

```json
{
  "display_name": "John Doe",
  "email": "john@example.com",
  "password": "your-secure-password"
}
```

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| display_name | string | User's display name | Required, 1-32 characters |
| email | string | User's email address | Required, valid email format, max 320 characters |
| password | string | User's password | Required, 8-128 characters |

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "Signup successful",
  "error": null,
  "data": null
}
```

**Cookies Set**:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token

#### Error Responses

- `400 Bad Request`: Invalid request body or validation error
- `400 Bad Request`: Email already in use
- `500 Internal Server Error`: Server-side error

### Log In

Authenticates an existing user.

**URL**: `/auth/login`  
**Method**: `POST`  
**Authentication**: None  

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "your-secure-password"
}
```

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| email | string | User's email address | Required, valid email format, max 320 characters |
| password | string | User's password | Required, 8-128 characters |

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "Login successful",
  "error": null,
  "data": null
}
```

**Cookies Set**:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token

#### Error Responses

- `400 Bad Request`: Invalid request body or validation error
- `400 Bad Request`: Invalid email or password
- `500 Internal Server Error`: Server-side error

### Refresh Token

Refreshes an expired access token using the refresh token.

**URL**: `/auth/refresh`  
**Method**: `POST`  
**Authentication**: Requires refresh token cookie  

#### Request Body

No request body needed

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "Token refreshed successfully",
  "error": null,
  "data": null
}
```

**Cookies Updated**:
- `access_token`: New JWT access token
- `refresh_token`: New JWT refresh token (if the current one is near expiration)

#### Error Responses

- `401 Unauthorized`: Invalid or expired refresh token
- `500 Internal Server Error`: Server-side error

---

## User Endpoints

### Get User Profile

Retrieves the authenticated user's profile information.

**URL**: `/user/profile`  
**Method**: `GET`  
**Authentication**: Required  

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "User profile acquired",
  "error": null,
  "data": {
    "id": "1234567890",
    "display_name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User ID not found in context
- `403 Forbidden`: User not found
- `500 Internal Server Error`: Error retrieving or processing user data

---

## URL Shortener Endpoints

### Create Short URL (Anonymous)

Creates a short URL without requiring authentication. Custom slugs are not allowed.

**URL**: `/url`  
**Method**: `POST`  
**Authentication**: Optional  

#### Request Body

```json
{
  "original_url": "https://example.com/very/long/url",
  "expires_at": "2023-12-31T23:59:59Z"
}
```

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| original_url | string | URL to shorten | Required, valid URL format |
| expires_at | string | Expiration date (ISO 8601) | Optional |

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "URL shortened successfully",
  "error": null,
  "data": {
    "short_code": "abc123",
    "original_url": "https://example.com/very/long/url",
    "short_url": "https://your-domain.com/abc123",
    "expires_at": "2023-12-31T23:59:59Z",
    "created_at": "2023-01-01T12:00:00Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body or validation error
- `500 Internal Server Error`: Server-side error

### Create Short URL with Custom Slug (Authenticated)

Creates a short URL with a custom slug, requiring authentication.

**URL**: `/url/custom`  
**Method**: `POST`  
**Authentication**: Required  

#### Request Body

```json
{
  "original_url": "https://example.com/very/long/url",
  "custom_slug": "my-brand",
  "expires_at": "2023-12-31T23:59:59Z"
}
```

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| original_url | string | URL to shorten | Required, valid URL format |
| custom_slug | string | Custom short code | Required, 1-20 characters, alphanumeric and hyphens only |
| expires_at | string | Expiration date (ISO 8601) | Optional |

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "URL shortened successfully",
  "error": null,
  "data": {
    "short_code": "my-brand",
    "original_url": "https://example.com/very/long/url",
    "short_url": "https://your-domain.com/my-brand",
    "expires_at": "2023-12-31T23:59:59Z",
    "created_at": "2023-01-01T12:00:00Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body or validation error
- `400 Bad Request`: Custom slug already in use
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server-side error

### Get User URLs

Retrieves all URLs created by the authenticated user.

**URL**: `/url/list`  
**Method**: `GET`  
**Authentication**: Required  

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "URLs retrieved successfully",
  "error": null,
  "data": {
    "urls": [
      {
        "id": 1234,
        "short_code": "abc123",
        "original_url": "https://example.com/very/long/url",
        "click_count": 42,
        "created_at": "2023-01-01T12:00:00Z",
        "expires_at": "2023-12-31T23:59:59Z"
      },
      {
        "id": 5678,
        "short_code": "my-brand",
        "original_url": "https://example.com/another/long/url",
        "click_count": 15,
        "created_at": "2023-01-15T12:00:00Z",
        "expires_at": null
      }
    ]
  }
}
```

#### Error Responses

- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Error retrieving URLs

### Get URL Analytics

Retrieves analytics data for a specific URL.

**URL**: `/url/:shortCode/analytics`  
**Method**: `GET`  
**Authentication**: Required  

#### URL Parameters

| Parameter | Description |
|-----------|-------------|
| shortCode | The short code of the URL to get analytics for |

#### Response

**Status Code**: `200 OK`

```json
{
  "message": "Analytics retrieved successfully",
  "error": null,
  "data": {
    "url": {
      "short_code": "abc123",
      "original_url": "https://example.com/very/long/url",
      "click_count": 42,
      "created_at": "2023-01-01T12:00:00Z",
      "expires_at": "2023-12-31T23:59:59Z"
    },
    "analytics": {
      "total_clicks": 42,
      "referrer_stats": [
        {
          "referrer": "https://google.com",
          "click_count": 20,
          "percentage": 47.62
        },
        {
          "referrer": "https://twitter.com",
          "click_count": 15,
          "percentage": 35.71
        },
        {
          "referrer": "direct",
          "click_count": 7,
          "percentage": 16.67
        }
      ],
      "country_stats": [
        {
          "country": "US",
          "click_count": 25,
          "percentage": 59.52
        },
        {
          "country": "GB",
          "click_count": 10,
          "percentage": 23.81
        },
        {
          "country": "CA",
          "click_count": 7,
          "percentage": 16.67
        }
      ],
      "hourly_engagement": [
        {
          "time_start": "2023-01-01T12:00:00Z",
          "time_end": "2023-01-01T13:00:00Z",
          "engagement": 15
        },
        {
          "time_start": "2023-01-01T11:00:00Z",
          "time_end": "2023-01-01T12:00:00Z",
          "engagement": 12
        }
      ]
    }
  }
}
```

#### Error Responses

- `400 Bad Request`: Short code is required
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User does not have permission to view analytics for this URL
- `404 Not Found`: URL not found
- `500 Internal Server Error`: Error retrieving analytics

---

## URL Redirection

### Redirect to Original URL

Redirects the user to the original URL associated with the given short code.

**URL**: `/:shortCode`  
**Method**: `GET`  
**Authentication**: None  
**Note**: This endpoint is at the root level, not under `/api/v1`

#### URL Parameters

| Parameter | Description |
|-----------|-------------|
| shortCode | The short code that identifies the shortened URL |

#### Response

**Status Code**: `301 Moved Permanently`  
**Headers**: `Location: [original URL]`

The user's browser is redirected to the original URL.

#### Error Responses

- `400 Bad Request`: Short code is required
- `404 Not Found`: Short URL not found
- `410 Gone`: Short URL has expired

---

## Security Considerations

1. **Authentication**: All sensitive operations require authentication.
2. **Rate Limiting**: The API employs rate limiting to prevent abuse.
3. **HTTPS**: All API requests should use HTTPS.
4. **Input Validation**: All inputs are validated to prevent injection attacks.
5. **URL Expiration**: URLs can be set to expire, enhancing security for temporary links.

---

## API Versions

The current API version is `v1`. The version is specified in the URL path.

## Rate Limiting

The API imposes rate limits to prevent abuse. Current limits:
- Anonymous requests: 60 requests per minute
- Authenticated requests: 120 requests per minute

When rate limits are exceeded, the API returns a `429 Too Many Requests` response.

## Rate Limiting Headers

Rate limiting information is included in the response headers:
- `X-RateLimit-Limit`: Maximum number of requests per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current minute
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Client Libraries

We provide official client libraries for:
- JavaScript/TypeScript

## Examples

### Creating a Short URL with a Custom Slug

```bash
curl -X POST https://yourdomain.com/api/v1/url/custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "original_url": "https://example.com/very/long/url",
    "custom_slug": "my-brand",
    "expires_at": "2023-12-31T23:59:59Z"
  }'
```

### Getting Analytics for a Short URL

```bash
curl -X GET https://yourdomain.com/api/v1/url/my-brand/analytics \
  -H "Authorization: Bearer your_jwt_token"
```

### Accessing a Shortened URL

```bash
curl -X GET https://yourdomain.com/my-brand
```

## Webhook Support (Future Feature)

Zipt plans to add webhook support in the future to notify your application when:
- A URL is clicked
- A custom threshold of clicks is reached
- A URL is about to expire

---

## Changelog

### v1 (Current)
- Initial release with core URL shortening functionality
- User authentication
- Basic analytics tracking
- Custom slugs for authenticated users 