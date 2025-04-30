# User API Documentation

This document provides detailed information about the user endpoints available in the Zipt URL Shortener API.

## Table of Contents

- [Get Profile](#get-profile)
- [Search User](#search-user)
- [Update Email](#update-email)
- [Update Display Name](#update-display-name)

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

## Update Email

Update the authenticated user's email address.

### Request

**Method:** `PUT`

**Endpoint:** `/api/v1/users/email`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
    "email": "newemail@example.com"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | New email address (must be valid and unique) |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
    "message": "Email updated successfully"
}
```

### Error Responses

**Unauthorized (Status Code: 403 Forbidden)**
```json
{
    "message": "UserID not found in context",
    "error": "ErrUserIDNotFound"
}
```

**Bad Request - Invalid Email (Status Code: 400 Bad Request)**
```json
{
    "message": "Invalid request",
    "error": "ErrBadRequest",
    "result": "Key: 'UpdateEmailRequest.Email' Error:Field validation for 'Email' failed on the 'email' tag"
}
```

**Email Already Used (Status Code: 409 Conflict)**
```json
{
    "message": "Email already in use",
    "error": "ErrEmailAlreadyUsed"
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
    "message": "Failed to update email",
    "error": "ErrSaveData",
    "result": {
        "details": "Error details"
    }
}
```

## Update Display Name

Update the authenticated user's display name.

### Request

**Method:** `PUT`

**Endpoint:** `/api/v1/users/display-name`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Body:**
```json
{
    "display_name": "New Display Name"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `display_name` | string | Yes | New display name (3-50 characters) |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
    "message": "Display name updated successfully"
}
```

### Error Responses

**Unauthorized (Status Code: 403 Forbidden)**
```json
{
    "message": "UserID not found in context",
    "error": "ErrUserIDNotFound"
}
```

**Bad Request - Invalid Display Name (Status Code: 400 Bad Request)**
```json
{
    "message": "Invalid request",
    "error": "ErrBadRequest",
    "result": "Key: 'UpdateDisplayNameRequest.DisplayName' Error:Field validation for 'DisplayName' failed on the 'min' tag"
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
    "message": "Failed to update display name",
    "error": "ErrSaveData",
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
| `ErrSaveData` | Error saving data to the database |
| `ErrBadRequest` | The request format is invalid or missing required fields |
| `ErrResourceNotFound` | The requested resource was not found |
| `ErrChangeType` | Error processing user data types |
| `ErrEmailAlreadyUsed` | The email address is already in use by another account |
