# User API Documentation

This document provides detailed information about the user endpoints available in the Zipt URL Shortener API.

## Table of Contents

- [Get Profile](#get-profile)
- [Search User](#search-user)

## Get Profile

Retrieve the current authenticated user's profile information.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/users/profile`

**Headers:**
```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
    "id": "123456789",
    "display_name": "Test User",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "created_at": "2023-05-15T10:30:45Z",
    "updated_at": "2023-05-15T10:30:45Z"
}
```

### Error Responses

**Unauthorized (Status Code: 403 Forbidden)**
```json
{
    "status": 403,
    "message": "UserID not found in context",
    "error": "ErrUserIDNotFound",
    "result": null
}
```

**User Not Found (Status Code: 403 Forbidden)**
```json
{
    "status": 403,
    "message": "User not found",
    "error": "ErrGetData",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
    "status": 500,
    "message": "Error retrieving user data",
    "error": "ErrGetData",
    "result": {
        "details": "Error details"
    }
}
```

## Search User

Search for a user by email address.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/users/search`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
```
email=user@example.com
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address to search for |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
    "id": "123456789",
    "display_name": "Test User",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg"
}
```

### Error Responses

**Unauthorized (Status Code: 401 Unauthorized)**
```json
{
    "status": 401,
    "message": "User not authenticated",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Bad Request - Missing Email (Status Code: 400 Bad Request)**
```json
{
    "status": 400,
    "message": "Email is required",
    "error": "ErrBadRequest",
    "result": null
}
```

**Bad Request - Self Invitation (Status Code: 400 Bad Request)**
```json
{
    "status": 400,
    "message": "You cannot invite yourself",
    "error": "ErrBadRequest",
    "result": null
}
```

**User Not Found (Status Code: 404 Not Found)**
```json
{
    "status": 404,
    "message": "User not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
    "status": 500,
    "message": "Error searching for user",
    "error": "ErrGetData",
    "result": {
        "details": "Error details"
    }
}
```

## Security Notes

1. **Authentication**: All user endpoints require authentication via a valid JWT token.

2. **Authorization**: Users can only access their own profile information.

3. **User Search**: The search endpoint only returns non-sensitive user information.

4. **HTTPS**: All API communication should be conducted over HTTPS to ensure the security of user data.

## Error Codes

| Error Code | Description |
|------------|-------------|
| `ErrUnauthorized` | The user is not authenticated |
| `ErrUserIDNotFound` | The user ID was not found in the authentication context |
| `ErrGetData` | Error retrieving data from the database |
| `ErrBadRequest` | The request format is invalid or missing required fields |
| `ErrResourceNotFound` | The requested resource was not found |
| `ErrChangeType` | Error processing user data types |
