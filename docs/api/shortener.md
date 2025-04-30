# URL Shortener API Documentation

This document provides detailed information about the URL shortener endpoints available in the Zipt URL Shortener API.

## Table of Contents

-   [Create Short URL](#create-short-url)
-   [Check Short Code Availability](#check-short-code-availability)
-   [Get User URLs](#get-user-urls)
-   [Update URL](#update-url)
-   [Delete URL](#delete-url)
-   [URL Analytics](#url-analytics)
-   [URL Time Series Data](#url-time-series-data)
-   [Redirect to Original URL](#redirect-to-original-url)

## Create Short URL

Create a new shortened URL, either anonymously or within a workspace.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/url` (anonymous) or `/api/v1/url/:workspaceID` (workspace)

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token} (required for workspace URLs or custom slugs)
```

**Body:**

```json
{
    "original_url": "https://example.com/some-very-long-path",
    "short_code": "custom-slug",
    "expires_at": "2023-12-31T23:59:59Z",
    "domain_id": 123456789
}
```

| Parameter      | Type              | Required | Description                                                             |
| -------------- | ----------------- | -------- | ----------------------------------------------------------------------- |
| `original_url` | string            | Yes      | The URL to be shortened (must be a valid URL)                           |
| `short_code`   | string            | No       | Custom slug for the short URL (authenticated users only, max 100 chars) |
| `expires_at`   | string (ISO 8601) | No       | Expiration date for the short URL                                       |
| `domain_id`    | integer           | No       | ID of custom domain to use (authenticated users only)                   |

### Successful Response

**Status Code:** `201 Created`

**Body:**

```json
{
    "status": 201,
    "message": "Short URL created successfully",
    "error": null,
    "result": {
        "short_code": "abc123",
        "original_url": "https://example.com/some-very-long-path",
        "short_url": "https://zipt.io/abc123",
        "domain_id": 0,
        "domain_name": "",
        "expires_at": "2023-12-31T23:59:59Z",
        "created_at": "2023-06-15T14:30:45Z"
    }
}
```

### Error Responses

**Invalid Request Format (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid request",
    "error": "ErrBadRequest",
    "result": "validation error message"
}
```

**Short Code Already Exists (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Custom slug already in use; please choose a different one",
    "error": "ErrBadRequest",
    "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**

```json
{
    "status": 401,
    "message": "Custom slugs require authentication",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error creating short URL",
    "error": "ErrSaveData",
    "result": null
}
```

## Check Short Code Availability

Check if a short code (custom slug) is available for use.

### Request

**Method:** `POST`

**Endpoint:** `/api/v1/url/check-shortcode`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
    "short_code": "custom-slug",
    "domain_id": 123456789
}
```

| Parameter    | Type    | Required | Description                                             |
| ------------ | ------- | -------- | ------------------------------------------------------- |
| `short_code` | string  | Yes      | The custom slug to check                                |
| `domain_id`  | integer | No       | ID of domain to check against (omit for default domain) |

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
    "status": 200,
    "message": "Short code availability checked",
    "error": null,
    "result": {
        "exists": false
    }
}
```

### Error Responses

**Invalid Request Format (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid request",
    "error": "ErrBadRequest",
    "result": "validation error message"
}
```

**Invalid Short Code Format (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid short code format",
    "error": "ErrBadRequest",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error checking short code",
    "error": "ErrGetData",
    "result": null
}
```

## Get User URLs

Retrieve all URLs created within a specific workspace.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/url/:workspaceID/list`

**Headers:**

```
Authorization: Bearer {access_token}
```

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
[
    {
        "id": "123456789",
        "short_code": "abc123",
        "original_url": "https://example.com/some-very-long-path",
        "short_url": "https://zipt.io/abc123",
        "domain_id": 0,
        "domain_name": "",
        "expires_at": "2023-12-31T23:59:59Z",
        "created_at": "2023-06-15T14:30:45Z",
        "updated_at": "2023-06-15T14:30:45Z",
        "total_clicks": 42
    },
    {
        "id": "987654321",
        "short_code": "xyz789",
        "original_url": "https://example.org/another-long-path",
        "short_url": "https://zipt.io/xyz789",
        "domain_id": 0,
        "domain_name": "",
        "expires_at": null,
        "created_at": "2023-06-16T10:20:30Z",
        "updated_at": "2023-06-16T10:20:30Z",
        "total_clicks": 17
    }
]
```

### Error Responses

**Unauthorized (Status Code: 401 Unauthorized)**

```json
{
    "status": 401,
    "message": "Authentication required",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Invalid Workspace (Status Code: 400 Bad Request)**

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
    "message": "Error retrieving URLs",
    "error": "ErrGetData",
    "result": null
}
```

## Update URL

Update an existing shortened URL.

### Request

**Method:** `PUT`

**Endpoint:** `/api/v1/url/:workspaceID/:urlID`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Body:**

```json
{
    "original_url": "https://example.com/updated-path",
    "custom_slug": "new-custom-slug",
    "expires_at": "2024-12-31T23:59:59Z",
    "domain_id": 987654321
}
```

| Parameter      | Type              | Required | Description                               |
| -------------- | ----------------- | -------- | ----------------------------------------- |
| `original_url` | string            | No       | New destination URL (must be a valid URL) |
| `custom_slug`  | string            | No       | New custom slug (max 100 chars)           |
| `expires_at`   | string (ISO 8601) | No       | New expiration date                       |
| `domain_id`    | integer           | No       | New domain ID                             |

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
    "status": 200,
    "message": "URL updated successfully",
    "error": null,
    "result": {
        "short_code": "new-custom-slug",
        "original_url": "https://example.com/updated-path",
        "short_url": "https://custom-domain.com/new-custom-slug",
        "domain_id": 987654321,
        "domain_name": "custom-domain.com",
        "expires_at": "2024-12-31T23:59:59Z",
        "created_at": "2023-06-15T14:30:45Z"
    }
}
```

### Error Responses

**Invalid Request Format (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid request",
    "error": "ErrBadRequest",
    "result": "validation error message"
}
```

**No Fields to Update (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "No fields to update were provided",
    "error": "ErrBadRequest",
    "result": null
}
```

**Short Code Already Exists (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Custom slug already in use; please choose a different one",
    "error": "ErrBadRequest",
    "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**

```json
{
    "status": 401,
    "message": "Authentication required",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "You don't have permission to update this URL",
    "error": "ErrForbidden",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Short URL not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error updating URL",
    "error": "ErrSaveData",
    "result": null
}
```

## Delete URL

Delete an existing shortened URL.

### Request

**Method:** `DELETE`

**Endpoint:** `/api/v1/url/:workspaceID/:urlID`

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
    "message": "URL deleted successfully",
    "error": null,
    "result": null
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "URL ID is required",
    "error": "ErrBadRequest",
    "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**

```json
{
    "status": 401,
    "message": "Authentication required",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "URL does not belong to this workspace",
    "error": "ErrForbidden",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Short URL not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error deleting URL",
    "error": "ErrSaveData",
    "result": null
}
```

## URL Analytics

Retrieve analytics data for a specific URL.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/url/:workspaceID/:urlID/analytics`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

```
start=1623718245  (Unix timestamp - optional, defaults to 10 hours before end)
end=1623761445    (Unix timestamp - optional, defaults to current time)
```

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
    "url": {
        "short_code": "abc123",
        "original_url": "https://example.com/some-very-long-path",
        "total_clicks": 42,
        "created_at": "2023-06-15T14:30:45Z",
        "expires_at": "2023-12-31T23:59:59Z"
    },
    "analytics": {
        "total_clicks": 42,
        "referrer": [
            {
                "value": "direct",
                "total": 15
            },
            {
                "value": "google.com",
                "total": 12
            }
        ],
        "country": [
            {
                "value": "United States",
                "total": 18
            },
            {
                "value": "Germany",
                "total": 10
            }
        ],
        "city": [
            {
                "value": "New York",
                "total": 8
            },
            {
                "value": "Berlin",
                "total": 7
            }
        ],
        "device": [
            {
                "value": "iPhone",
                "total": 20
            },
            {
                "value": "Desktop",
                "total": 22
            }
        ],
        "browser": [
            {
                "value": "Chrome",
                "total": 25
            },
            {
                "value": "Safari",
                "total": 17
            }
        ],
        "os": [
            {
                "value": "iOS",
                "total": 20
            },
            {
                "value": "Windows",
                "total": 15
            }
        ]
    }
}
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid URL ID format",
    "error": "ErrBadRequest",
    "result": null
}
```

**Invalid Date Format (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Invalid start date format",
    "error": "ErrBadRequest",
    "result": null
}
```

**Unauthorized (Status Code: 401 Unauthorized)**

```json
{
    "status": 401,
    "message": "Authentication required",
    "error": "ErrUnauthorized",
    "result": null
}
```

**Forbidden (Status Code: 403 Forbidden)**

```json
{
    "status": 403,
    "message": "You don't have permission to view analytics for this URL",
    "error": "ErrForbidden",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Short URL not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Server Error (Status Code: 500 Internal Server Error)**

```json
{
    "status": 500,
    "message": "Error retrieving analytics data",
    "error": "ErrGetData",
    "result": null
}
```

## URL Time Series Data

Retrieve time series analytics data for a specific URL with optional filters.

### Request

**Method:** `GET`

**Endpoint:** `/api/v1/url/:workspaceID/:urlID/analytics/timeseries`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**

```
start=1623718245          (Unix timestamp - optional, defaults to 10 hours before end)
end=1623761445            (Unix timestamp - optional, defaults to current time)
referrer=google.com       (optional filter)
country=United%20States   (optional filter)
city=New%20York           (optional filter)
device=iPhone             (optional filter)
browser=Chrome            (optional filter)
os=iOS                    (optional filter)
```

### Successful Response

**Status Code:** `200 OK`

**Body:**

```json
{
    "url": {
        "id": 123456789,
        "short_code": "abc123",
        "original_url": "https://example.com/some-very-long-path"
    },
    "time_series": {
        "data": [
            {
                "timestamp": "2023-06-15T14:00:00Z",
                "clicks": 5
            },
            {
                "timestamp": "2023-06-15T15:00:00Z",
                "clicks": 8
            },
            {
                "timestamp": "2023-06-15T16:00:00Z",
                "clicks": 12
            }
        ],
        "granularity": "hourly",
        "filters": {
            "device": "iPhone",
            "browser": "Chrome"
        },
        "date_range": {
            "start": "2023-06-15T14:00:00Z",
            "end": "2023-06-15T16:59:59Z"
        }
    }
}
```

### Error Responses

Same as [URL Analytics](#url-analytics)

## Redirect to Original URL

Redirect a user from a short URL to the original destination URL. This endpoint is typically accessed by users clicking on short links.

### Request

**Method:** `GET`

**Endpoint:** `/:shortCode` or custom domain with path `/:shortCode`

### Successful Response

**Status Code:** `301 Moved Permanently`

**Headers:**

```
Location: https://original-destination-url.com/path
```

### Error Responses

**Invalid Request (Status Code: 400 Bad Request)**

```json
{
    "status": 400,
    "message": "Short code is required",
    "error": "ErrBadRequest",
    "result": null
}
```

**Not Found (Status Code: 404 Not Found)**

```json
{
    "status": 404,
    "message": "Short URL not found",
    "error": "ErrResourceNotFound",
    "result": null
}
```

**Gone (Status Code: 410 Gone)**

```json
{
    "status": 410,
    "message": "Short URL has expired",
    "error": "ErrResourceGone",
    "result": null
}
```

## Analytics Tracking

The API automatically tracks the following information when a short URL is accessed:

1. **Referrer** - Where the click came from (sanitized to remove query parameters)
2. **Geolocation** - Country and city based on IP address
3. **Device** - Type of device used (Desktop, iPhone, Android, etc.)
4. **Browser** - Browser used (Chrome, Safari, Firefox, etc.)
5. **OS** - Operating system (Windows, macOS, iOS, Android, etc.)

This data is used to generate both aggregated analytics and time-series data. The system automatically determines the appropriate time granularity (minute, hourly, daily, monthly) based on the selected date range.

Analytics endpoints support:
- Filtering by any tracked dimension (referrer, country, city, device, browser, OS)
- Custom date ranges using Unix timestamps
- Automatic time granularity adjustment

Analytics data is collected asynchronously and does not impact redirect performance.

## Error Codes

| Error Code            | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `ErrBadRequest`       | The request format is invalid or missing required fields     |
| `ErrUnauthorized`     | The user is not authenticated or lacks necessary permissions |
| `ErrForbidden`        | The user does not have access to the requested resource      |
| `ErrResourceNotFound` | The requested URL or resource was not found                  |
| `ErrResourceGone`     | The requested URL has expired                                |
| `ErrSaveData`         | Error saving data to the database                            |
| `ErrGetData`          | Error retrieving data from the database                      |
| `ErrParse`            | Error parsing or processing data                             |
