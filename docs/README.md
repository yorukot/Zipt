# Zipt API Documentation

This directory contains documentation for the Zipt URL Shortener API.

## Available Documentation

- [API.md](api.md) - Comprehensive API documentation in Markdown format
- [postman_collection.json](postman_collection.json) - Postman collection that can be imported to test the API

## Importing the Postman Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "Import File" and choose the `postman_collection.json` file
4. The collection will be imported with all the available endpoints

## Using the Collection

1. After importing, you'll need to configure the environment variables:
   - `base_url`: The base URL of the API (e.g., `http://localhost:8080/api/v1`)
   - `auth_token`: Your JWT authentication token (received after login)
   - `refresh_token`: Your refresh token (received after login)
   - `short_code`: The short code of a URL you want to interact with
   - `workspace_id`: Your workspace ID
   - `domain_id`: The ID of a domain you want to interact with
   - `user_id`: The ID of a user you want to add to a workspace or update their role

2. The collection is organized into folders:
   - **Authentication**: Endpoints for user registration, login, logout, etc.
   - **URL Operations**: Endpoints for creating, updating, and deleting short URLs
   - **Analytics**: Endpoints for retrieving analytics data for short URLs
   - **Workspace**: Endpoints for managing workspaces and workspace users
   - **Domain**: Endpoints for managing custom domains and domain verification

## Time Range Parameters

The analytics endpoints support intuitive time range parameters:

- `days`: Number of days to include (e.g., `?days=7`)
- `hours`: Number of hours to include (e.g., `?hours=24`)
- `mins`: Number of minutes to include (e.g., `?mins=30`)
- `months`: Number of months to include (e.g., `?months=3`)
- `years`: Number of years to include (e.g., `?years=1`)

You can combine these parameters to create custom time ranges. If no parameters are provided, data from the last 24 hours will be returned.

## Pagination

Endpoints that return large amounts of data support pagination:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 10, max: 100)

## Need Help?

If you have any questions or need help with the API, please contact the Zipt support team. 