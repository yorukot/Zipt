# Domain API Documentation

This document provides detailed information about the domain management endpoints available in the Zipt URL Shortener API.

## Table of Contents

-   [Get All Domains](#get-all-domains)
-   [Create Domain](#create-domain)
-   [Get Domain](#get-domain)
-   [Delete Domain](#delete-domain)
-   [Verify Domain](#verify-domain)

## Get All Domains

Retrieve all domains associated with a workspace.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/workspace/:workspaceID/domain`

**Headers:**

```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
    {
      "id": 123456789,
      "workspace_id": 987654321,
      "domain": "example.com",
      "verified": true,
      "verified_at": "2023-06-15T12:30:45Z",
      "created_at": "2023-06-10T10:20:30Z",
      "updated_at": "2023-06-15T12:30:45Z"
    },
    {
      "id": 123456790,
      "workspace_id": 987654321,
      "domain": "subdomain.example.com",
      "verified": false,
      "verified_at": null,
      "created_at": "2023-06-12T11:22:33Z",
      "updated_at": "2023-06-12T11:22:33Z"
    }
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

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "User does not have access to this workspace",
    "error": "ErrForbidden",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Failed to get domains",
    "error": "ErrGetData",
    "result": {
        "details": "Error details"
    }
}
```

## Create Domain

Add a new domain to a workspace.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/workspace/:workspaceID/domain`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**

```json
{
    "domain": "newdomain.com"
}
```

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `domain`  | string | Yes      | Fully qualified domain name (FQDN) |

### Successful Response

**Status Code:** `201 Created`

**Body:**

```json
{
    "status": 201,
    "message": "Domain created successfully",
    "error": null,
    "result": {
        "id": 123456791,
        "workspace_id": 987654321,
        "domain": "newdomain.com",
        "verified": false,
        "verify_token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...",
        "created_at": "2023-06-15T14:25:36Z",
        "updated_at": "2023-06-15T14:25:36Z"
    }
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

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "User does not have access to this workspace",
    "error": "ErrForbidden",
    "result": null
}
```

**Bad Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid request format",
    "error": "ErrBadRequest",
    "result": null
}
```

**Conflict (Status Code: 409 Conflict)**

```json
{
    "status": 409,
    "message": "Domain already exists",
    "error": "ErrResourceExists",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Failed to create domain",
    "error": "ErrSaveData",
    "result": {
        "details": "Error details"
    }
}
```

## Get Domain

Retrieve a specific domain by ID.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/workspace/:workspaceID/domain/:domainID`

**Headers:**

```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
  "id": 123456789,
  "workspace_id": 987654321,
  "domain": "example.com",
  "verified": true,
  "verified_at": "2023-06-15T12:30:45Z",
  "created_at": "2023-06-10T10:20:30Z",
  "updated_at": "2023-06-15T12:30:45Z"
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

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "You don't have permission to access this domain",
    "error": "ErrForbidden",
    "result": null
}
```

**Bad Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid domain ID",
    "error": "ErrBadRequest",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Domain not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

## Delete Domain

Delete a domain from a workspace. Only workspace owners can perform this operation.

### Request

**Method:** `DELETE`

**Endpoint:** `/api/v1/workspace/:workspaceID/domain/:domainID`

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
    "message": "Domain deleted successfully",
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

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "Only workspace owners can delete domains",
    "error": "ErrForbidden",
    "result": null
}
```

**Bad Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid domain ID",
    "error": "ErrBadRequest",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Domain not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Failed to delete domain",
    "error": "ErrDeleteData",
    "result": {
        "details": "Error details"
    }
}
```

## Verify Domain

Verify domain ownership by checking a DNS TXT record.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/workspace/:workspaceID/domain/:domainID/verify`

**Headers:**

```
Authorization: Bearer {access_token}
```

### Successful Response (Verified)

**Status Code:** `200 OK`

**Body:**

```json
{
    "status": 200,
    "message": "Domain verified successfully",
    "error": null,
    "result": {
        "domain": "example.com",
        "verify_status": "verified"
    }
}
```

### Successful Response (Already Verified)

**Status Code:** `200 OK`

**Body:**

```json
{
    "status": 200,
    "message": "Domain is already verified",
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

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "You don't have permission to verify this domain",
    "error": "ErrForbidden",
    "result": null
}
```

**Bad Request (Status Code: 400 Bad Request) - Verification Failed**

```json
{
    "status": 400,
    "message": "Domain verification failed. Please add the TXT record with the verification token",
    "error": null,
    "result": {
        "domain": "example.com",
        "verify_token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...",
        "txt_record": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...",
        "instructions": "Please add a TXT record to your domain with the following value",
        "verify_status": "pending"
    }
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Domain not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error verifying domain",
    "error": "ErrGetData",
    "result": {
        "details": "Error details"
    }
}
```

## Domain Verification Process

1. Create a domain using the [Create Domain](#create-domain) endpoint.
2. Add a TXT record to your domain's DNS settings with the `verify_token` value received in the response.
3. Call the [Verify Domain](#verify-domain) endpoint to check if the TXT record exists.
4. If verification is successful, the domain will be marked as verified and can be used for your workspace.

## Error Codes

| Error Code            | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `ErrUnauthorized`     | The user is not authenticated                            |
| `ErrForbidden`        | The user does not have the required permissions          |
| `ErrBadRequest`       | The request format is invalid or missing required fields |
| `ErrResourceNotFound` | The requested domain was not found                       |
| `ErrResourceExists`   | The domain already exists                                |
| `ErrGetData`          | Error retrieving data from the database                  |
| `ErrSaveData`         | Error saving data to the database                        |
| `ErrDeleteData`       | Error deleting data from the database                    |
| `ErrParseData`        | Error parsing data or parameters                         |
