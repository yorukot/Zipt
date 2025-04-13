# Zipt URL Shortener API Documentation

## Overview

Zipt is a URL shortener service that allows users to create and manage short URLs. This document provides complete details about the API endpoints for interacting with the Zipt service.

Base URL: `http://localhost:8080/api/v1` (or your deployed API URL)

## Authentication

Most endpoints require authentication using a JWT token. After login, include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Register

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "display_name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response**: Returns user details and authentication tokens.

### Login

Authenticate user and get access token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response**: Returns authentication tokens.

### Refresh Token

Refresh an expired access token.

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: Yes (Refresh token)

**Response**: Returns a new access token.

### Logout

Log out and invalidate tokens.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes

**Response**: Confirmation of successful logout.

### Change Password

Change user password.

- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "current_password": "password123",
  "new_password": "newPassword123"
}
```

**Response**: Confirmation of password change.

## User

### Get User Profile

Get the authenticated user's profile information.

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns user profile information.

## Workspace

### Create Workspace

Create a new workspace.

- **URL**: `/workspace`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "name": "My Workspace"
}
```

**Response**: Returns the created workspace details.

### Get Workspaces

Get all workspaces for the authenticated user.

- **URL**: `/workspaces`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns a list of workspaces.

### Get Workspace Details

Get details of a specific workspace.

- **URL**: `/workspace/{workspace_id}`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns the workspace details.

### Update Workspace

Update workspace details (owner only).

- **URL**: `/workspace/{workspace_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "name": "Updated Workspace Name"
}
```

**Response**: Returns the updated workspace details.

### Delete Workspace

Delete a workspace (owner only).

- **URL**: `/workspace/{workspace_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Response**: Confirmation of workspace deletion.

### Add User to Workspace

Add a user to a workspace.

- **URL**: `/workspace/{workspace_id}/user`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "user_id": "123456789"
}
```

**Response**: Confirmation of user addition to workspace.

### Remove User from Workspace

Remove a user from a workspace (owner only).

- **URL**: `/workspace/{workspace_id}/user/{user_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Response**: Confirmation of user removal from workspace.

## Domain

### Get Domains

Get all domains for a workspace.

- **URL**: `/workspace/{workspace_id}/domain`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns a list of domains associated with the workspace.

### Create Domain

Add a new custom domain to a workspace.

- **URL**: `/workspace/{workspace_id}/domain`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "domain": "example.com"
}
```

**Response**: Returns the created domain details.

### Get Domain Details

Get details for a specific domain.

- **URL**: `/workspace/{workspace_id}/domain/{domain_id}`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns the domain details.

### Verify Domain

Verify domain ownership by checking DNS TXT record.

- **URL**: `/workspace/{workspace_id}/domain/{domain_id}/verify`
- **Method**: `POST`
- **Auth Required**: Yes

**Response**: Returns verification status.

### Delete Domain

Delete a domain from a workspace (owner only).

- **URL**: `/workspace/{workspace_id}/domain/{domain_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Response**: Confirmation of domain deletion.

## URL Shortener

### Create Short URL (Public)

Create a short URL without authentication.

- **URL**: `/url`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "original_url": "https://example.com/very/long/url"
}
```

**Response**: Returns the created short URL details.

### Check Shortcode Availability

Check if a custom shortcode is available.

- **URL**: `/check-shortcode`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "short_code": "my-custom-code"
}
```

**Response**: Returns availability status.

### Create Short URL (Workspace)

Create a short URL in a workspace (with optional custom code and domain).

- **URL**: `/url/{workspace_id}`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "original_url": "https://example.com/very/long/url",
  "short_code": "my-custom-code",
  "domain_id": 123456789,
  "expires_at": "2023-12-31T23:59:59Z"
}
```

**Response**: Returns the created short URL details.

### List URLs

Get all URLs in a workspace.

- **URL**: `/url/{workspace_id}/list`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Returns a list of URLs in the workspace.

### Update URL

Update an existing short URL.

- **URL**: `/url/{workspace_id}/{url_id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:

```json
{
  "original_url": "https://example.com/updated/url",
  "custom_slug": "updated-code",
  "expires_at": "2024-12-31T23:59:59Z",
  "domain_id": 123456789
}
```

**Response**: Returns the updated URL details.

### Delete URL

Delete a short URL.

- **URL**: `/url/{workspace_id}/{url_id}`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Response**: Confirmation of URL deletion.

### Get URL Analytics

Get analytics data for a specific URL.

- **URL**: `/url/{workspace_id}/{url_id}/analytics`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `start`: Start timestamp (Unix)
  - `end`: End timestamp (Unix)

**Response**: Returns analytics data for the URL.

### Get URL Time Series Data

Get time series analytics data for a specific URL with optional filters.

- **URL**: `/url/{workspace_id}/{url_id}/analytics/timeseries`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `start`: Start timestamp (Unix)
  - `end`: End timestamp (Unix)
  - `referrer`: Filter by referrer
  - `browser`: Filter by browser
  - `country`: Filter by country
  - `device`: Filter by device
  - `os`: Filter by operating system

**Response**: Returns time series analytics data.

### Redirect to Original URL

Redirect a short code to the original URL.

- **URL**: `/{short_code}`
- **Method**: `GET`
- **Auth Required**: No

**Response**: HTTP 302 redirect to the original URL.

## Error Responses

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Error responses include a JSON body with error details:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```
