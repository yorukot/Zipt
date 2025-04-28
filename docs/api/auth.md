# Authentication API Documentation

This document provides detailed information about the authentication endpoints available in the Zipt URL Shortener API.

## Table of Contents

- [Register](#register)
- [Login](#login)
- [Refresh Token](#refresh-token)
- [Logout](#logout)
- [Check Login Status](#check-login-status)
- [Change Password](#change-password)

## Register

Create a new user account.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "display_name": "Test User",
  "email": "user@example.com",
  "password": "password123"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `display_name` | string | Yes | User's display name (1-32 characters) |
| `email` | string | Yes | User's email address (valid email format, max 320 characters) |
| `password` | string | Yes | User's password (8-128 characters) |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Signup successful",
  "error": null,
  "result": {
    "user_id": "123456789",
    "email": "user@example.com",
    "display_name": "Test User"
  }
}
```

### Error Responses

**Invalid Request Format (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid request format",
  "error": "ErrBadRequest",
  "result": {
    "details": "Error details here"
  }
}
```

**Email Already Used (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Email already in use",
  "error": "ErrEmailAlreadyUsed",
  "result": {
    "field": "email"
  }
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Error message",
  "error": "ErrorType",
  "result": {
    "details": "Error details"
  }
}
```

## Login

Authenticate a user and retrieve access tokens.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Login successful",
  "error": null,
  "result": {
    "user": {
      "id": "123456789", 
      "email": "user@example.com",
      "display_name": "Test User"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": "2023-06-15T15:30:45Z"
    }
  }
}
```

### Error Responses

**Invalid Credentials (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "Invalid email or password",
  "error": "ErrInvalidCredentials",
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

## Refresh Token

Refresh an expired access token using a valid session.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/auth/refresh`

**Cookies:**
The request should include the session cookie set during login.

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Token refreshed successfully",
  "error": null,
  "result": {
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": "2023-06-15T16:30:45Z"
    }
  }
}
```

### Error Responses

**Invalid Session (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "Invalid or expired session",
  "error": "ErrInvalidSession",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Error refreshing token",
  "error": "ErrGenerateToken",
  "result": {
    "details": "Error details"
  }
}
```

## Logout

Log out a user by invalidating their current session.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/auth/logout`

**Cookies:**
The request should include the session cookie to be invalidated.

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Logout successful",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Session (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "Invalid or expired session",
  "error": "ErrInvalidSession",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Error during logout",
  "error": "ErrDeleteSession",
  "result": {
    "details": "Error details"
  }
}
```

## Check Login Status

Check if a user is currently logged in and retrieve basic profile information.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/auth/check`

**Headers:**
```
Cookie: session=your-session-cookie  (optional)
```

### Successful Response (Logged In)

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "User is logged in",
  "error": null,
  "result": {
    "logged_in": true,
    "user": {
      "id": "123456789",
      "email": "user@example.com",
      "display_name": "Test User"
    }
  }
}
```

### Successful Response (Not Logged In)

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "User is not logged in",
  "error": null,
  "result": {
    "logged_in": false
  }
}
```

## Change Password

Change the password for the authenticated user.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/auth/change-password`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `current_password` | string | Yes | User's current password |
| `new_password` | string | Yes | User's new password (8-128 characters) |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Password changed successfully",
  "error": null,
  "result": null
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

**Invalid Password (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Current password is incorrect",
  "error": "ErrInvalidPassword",
  "result": null
}
```

**Invalid Request Format (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid request format",
  "error": "ErrBadRequest",
  "result": {
    "details": "Error details here"
  }
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Error updating password",
  "error": "ErrSaveData",
  "result": {
    "details": "Error details"
  }
}
```

## Security Notes

1. **Password Storage**: Passwords are securely hashed using bcrypt before being stored in the database.

2. **JWT Tokens**: The API uses JWT (JSON Web Tokens) for authentication.

3. **Session Management**: Sessions are managed on the server and can be revoked at any time.

4. **HTTPS**: All API communication should be conducted over HTTPS to ensure the security of authentication data.

5. **Rate Limiting**: Authentication endpoints have rate limiting to prevent brute force attacks.

## Error Codes

| Error Code | Description |
|------------|-------------|
| `ErrBadRequest` | The request format is invalid or missing required fields |
| `ErrEmailAlreadyUsed` | The email address is already registered |
| `ErrInvalidCredentials` | The provided email or password is incorrect |
| `ErrInvalidSession` | The session is invalid or has expired |
| `ErrUnauthorized` | The user is not authenticated |
| `ErrInvalidPassword` | The provided current password is incorrect |
| `ErrSaveData` | Error saving data to the database |
| `ErrGetData` | Error retrieving data from the database |
| `ErrDeleteSession` | Error deleting session from the database |
| `ErrGenerateToken` | Error generating JWT token |
| `ErrHashData` | Error hashing password |

## Rate Limiting

The authentication endpoints have the following rate limits:

- `/auth/register`: 10 requests per hour per IP address
- `/auth/login`: 10 requests per minute per IP address
- `/auth/refresh`: 60 requests per hour per user
- `/auth/change-password`: 5 requests per hour per user
