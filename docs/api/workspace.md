# Workspace API Documentation

This document provides detailed information about the workspace management endpoints available in the Zipt URL Shortener API.

## Table of Contents

- [Create Workspace](#create-workspace)
- [Get Workspaces](#get-workspaces)
- [Get Workspace](#get-workspace)
- [Update Workspace](#update-workspace)
- [Delete Workspace](#delete-workspace)
- [Get User Invitations](#get-user-invitations)
- [Get Workspace Invitations](#get-workspace-invitations)
- [Invite User](#invite-user)
- [Update Invitation](#update-invitation)
- [Remove User](#remove-user)

## Create Workspace

Create a new workspace.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/workspace`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "name": "My Workspace"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the workspace (max 60 characters) |

### Successful Response

**Status Code:** `201 Created`

**Body:**
```json
{
  "status": 201,
  "message": "Workspace created successfully",
  "error": null,
  "result": {
    "id": "123456789",
    "name": "My Workspace",
    "created_at": "2023-06-15T14:30:45Z",
    "updated_at": "2023-06-15T14:30:45Z"
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
  "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "User not authenticated",
  "error": "ErrUnauthorized",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to create workspace",
  "error": "ErrSaveData",
  "result": null
}
```

## Get Workspaces

Retrieve all workspaces the current user is a member of.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/workspaces`

**Headers:**
```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Workspaces fetched successfully",
  "error": null,
  "result": [
    {
      "id": "123456789",
      "name": "My Workspace",
      "created_at": "2023-06-15T14:30:45Z",
      "updated_at": "2023-06-15T14:30:45Z"
    },
    {
      "id": "987654321",
      "name": "Another Workspace",
      "created_at": "2023-06-16T10:20:30Z",
      "updated_at": "2023-06-16T10:20:30Z"
    }
  ]
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

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to get workspaces",
  "error": "ErrGetData",
  "result": {
    "details": "Error details"
  }
}
```

## Get Workspace

Retrieve details of a specific workspace.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/workspace/:workspaceID`

**Headers:**
```
Authorization: Bearer {access_token}
```

| URL Parameter | Type | Required | Description |
|---------------|------|----------|-------------|
| `workspaceID` | string | Yes | ID of the workspace to retrieve |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Workspace fetched successfully",
  "error": null,
  "result": {
    "id": "123456789",
    "name": "My Workspace",
    "created_at": "2023-06-15T14:30:45Z",
    "updated_at": "2023-06-15T14:30:45Z"
  }
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Workspace ID is required",
  "error": "ErrBadRequest",
  "result": null
}
```

**Not Found (Status Code: 404 Not Found)**
```json
{
  "status": 404,
  "message": "Workspace not found",
  "error": "ErrResourceNotFound",
  "result": null
}
```

## Update Workspace

Update a workspace's details. Only workspace owners can perform this action.

### Request

**Method:** `PUT`

**Endpoint:** `/api/v1/workspace/:workspaceID`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "name": "Updated Workspace Name"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | New name for the workspace (max 60 characters) |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Workspace updated successfully",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid request format",
  "error": "ErrBadRequest",
  "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**
```json
{
  "status": 403,
  "message": "You don't have permission to update this workspace",
  "error": "ErrForbidden",
  "result": null
}
```

**Not Found (Status Code: 404 Not Found)**
```json
{
  "status": 404,
  "message": "Workspace not found",
  "error": "ErrResourceNotFound",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to update workspace",
  "error": "ErrSaveData",
  "result": {
    "details": "Error details"
  }
}
```

## Delete Workspace

Delete a workspace. Only workspace owners can perform this action.

### Request

**Method:** `DELETE`

**Endpoint:** `/api/v1/workspace/:workspaceID`

**Headers:**
```
Authorization: Bearer {access_token}
```

| URL Parameter | Type | Required | Description |
|---------------|------|----------|-------------|
| `workspaceID` | string | Yes | ID of the workspace to delete |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Workspace deleted successfully",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Workspace ID is required",
  "error": "ErrBadRequest",
  "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "User ID not found",
  "error": "ErrUnauthorized",
  "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**
```json
{
  "status": 403,
  "message": "Only workspace owners can delete workspaces",
  "error": "ErrForbidden",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to delete workspace",
  "error": "ErrSaveData",
  "result": null
}
```

## Get User Invitations

Retrieve all pending invitations for the current user.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/invitations`

**Headers:**
```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Invitations fetched successfully",
  "error": null,
  "result": [
    {
      "id": "123456789",
      "workspace_id": "987654321",
      "user_id": "111222333",
      "inviter_id": "444555666",
      "status": "pending",
      "workspace_name": "Team Workspace",
      "inviter_name": "John Doe"
    },
    {
      "id": "987654321",
      "workspace_id": "123123123",
      "user_id": "111222333",
      "inviter_id": "777888999",
      "status": "pending",
      "workspace_name": "Marketing Team",
      "inviter_name": "Jane Smith"
    }
  ]
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

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to get invitations",
  "error": "ErrGetData",
  "result": null
}
```

## Get Workspace Invitations

Retrieve all pending invitations for a specific workspace. User must be a member of the workspace.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/workspace/:workspaceID/invitations`

**Headers:**
```
Authorization: Bearer {access_token}
```

| URL Parameter | Type | Required | Description |
|---------------|------|----------|-------------|
| `workspaceID` | string | Yes | ID of the workspace |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Invitations fetched successfully",
  "error": null,
  "result": [
    {
      "id": "123456789",
      "workspace_id": "987654321",
      "user_id": "111222333",
      "inviter_id": "444555666",
      "status": "pending"
    },
    {
      "id": "987654321",
      "workspace_id": "987654321",
      "user_id": "222333444",
      "inviter_id": "444555666",
      "status": "pending"
    }
  ]
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Workspace ID is required",
  "error": "ErrBadRequest",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to get invitations",
  "error": "ErrGetData",
  "result": null
}
```

## Invite User

Invite a user to join a workspace. User must be a member of the workspace to send invitations.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/workspace/:workspaceID/invite`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "user_id": "111222333"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | ID of the user to invite |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Invitation sent successfully",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid request format",
  "error": "ErrBadRequest",
  "result": null
}
```

**User Already Exists (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "User already exists in workspace",
  "error": "ErrBadRequest",
  "result": null
}
```

**Invitation Already Exists (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invitation already sent to this user",
  "error": "ErrBadRequest",
  "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "User not authenticated",
  "error": "ErrUnauthorized",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to create invitation",
  "error": "ErrSaveData",
  "result": null
}
```

## Update Invitation

Accept or reject a workspace invitation.

### Request

**Method:** `PUT`

**Endpoint:** `/api/v1/invitation/:invitationID`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "status": "accepted"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | New status of invitation (must be "accepted" or "rejected") |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "Invitation accepted successfully",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid request format",
  "error": "ErrBadRequest",
  "result": null
}
```

**Already Processed (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invitation has already been processed",
  "error": "ErrBadRequest",
  "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**
```json
{
  "status": 401,
  "message": "User not authenticated",
  "error": "ErrUnauthorized",
  "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**
```json
{
  "status": 403,
  "message": "You don't have permission to update this invitation",
  "error": "ErrForbidden",
  "result": null
}
```

**Not Found (Status Code: 404 Not Found)**
```json
{
  "status": 404,
  "message": "Invitation not found",
  "error": "ErrResourceNotFound",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to update invitation",
  "error": "ErrSaveData",
  "result": null
}
```

## Remove User

Remove a user from a workspace. Only workspace owners can perform this action.

### Request

**Method:** `DELETE`

**Endpoint:** `/api/v1/workspace/:workspaceID/user/:userId`

**Headers:**
```
Authorization: Bearer {access_token}
```

| URL Parameter | Type | Required | Description |
|---------------|------|----------|-------------|
| `workspaceID` | string | Yes | ID of the workspace |
| `userId` | string | Yes | ID of the user to remove |

### Successful Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "status": 200,
  "message": "User removed from workspace",
  "error": null,
  "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**
```json
{
  "status": 400,
  "message": "Invalid user ID",
  "error": "ErrBadRequest",
  "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**
```json
{
  "status": 403,
  "message": "You don't have permission to remove users from this workspace",
  "error": "ErrForbidden",
  "result": null
}
```

**Not Found (Status Code: 404 Not Found)**
```json
{
  "status": 404,
  "message": "User not found in workspace",
  "error": "ErrResourceNotFound",
  "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**
```json
{
  "status": 500,
  "message": "Failed to remove user from workspace",
  "error": "ErrSaveData",
  "result": {
    "details": "Error details"
  }
}
```

## Permission Levels

The Workspace API enforces two levels of permissions:

1. **Member** - Users can view workspace details, invite other users, and view workspace invitations
2. **Owner** - Users have full control including updating workspace details, deleting the workspace, and removing users

## Error Codes

| Error Code | Description |
|------------|-------------|
| `ErrBadRequest` | The request format is invalid or missing required fields |
| `ErrUnauthorized` | The user is not authenticated |
| `ErrForbidden` | The user does not have permission to perform the requested action |
| `ErrResourceNotFound` | The requested resource (workspace, invitation, etc.) was not found |
| `ErrSaveData` | Error saving data to the database |
| `ErrGetData` | Error retrieving data from the database |
