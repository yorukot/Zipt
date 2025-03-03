# Zipt URL Shortener

A robust URL shortening service with analytics tracking built with Go and Gin.

## Features

- **URL Shortening**: Generate short URLs for long links
- **Custom Short Codes**: Registered users can create custom short codes
- **Analytics Tracking**: Track click counts, browser information, and referrers
- **User Authentication**: JWT-based user authentication
- **API Support**: RESTful API for programmatic access

## Tech Stack

- **Backend**: Go with Gin framework
- **Database**: Flexible support for PostgreSQL, MySQL, MariaDB, or SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Structured logging with Zap

## Getting Started

### Prerequisites

- Go 1.17 or higher
- Database (PostgreSQL, MySQL, MariaDB, or SQLite)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/zipt.git
   cd zipt
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Copy the environment template and modify as needed:
   ```bash
   cp template.env .env
   ```

4. Set up the environment variables in `.env`:
   ```
   # Server configuration
   VERSION=1
   BASE_URL=http://localhost:8080/
   PORT=8080
   
   # Database configuration
   DATABASE_TYPE=postgres  # postgres, mysql, mariadb, or sqlite
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=yourpassword
   DATABASE_DBNAME=zipt
   DATABASE_SSLMODE=disable
   ```

5. Run the application:
   ```bash
   go run main.go
   ```

### Docker Setup

For Docker enthusiasts, a Docker Compose setup is provided:

```bash
docker-compose up -d
```

## API Documentation

See [API Documentation](docs/api.md) for detailed information on available endpoints.

### Quick Examples

#### Create a Short URL (Anonymous)

```bash
curl -X POST http://localhost:8080/api/v1/url \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://example.com/very/long/url"
  }'
```

#### Create a Short URL with Custom Code (Authenticated)

```bash
curl -X POST http://localhost:8080/api/v1/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "original_url": "https://example.com/very/long/url",
    "custom_slug": "my-brand"
  }'
```

## Project Structure

```
zipt/
├── app/
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── queries/         # Database queries
│   └── routes/          # API routes
├── pkg/
│   ├── cache/           # Caching mechanisms
│   ├── database/        # Database connection
│   ├── encryption/      # Encryption utilities
│   ├── logger/          # Logging utilities
│   ├── middleware/      # HTTP middleware
│   ├── oauth/           # OAuth authentication
│   ├── s3/              # S3 file storage
│   └── utils/           # Utility functions
├── static/              # Static files
├── main.go              # Application entry point
├── go.mod               # Go modules
├── go.sum               # Go modules checksums
├── .env                 # Environment variables
└── docker-compose.yml   # Docker Compose configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Gin](https://github.com/gin-gonic/gin) for the web framework
- [GORM](https://gorm.io/) for the ORM
- All other open-source packages used in this project
