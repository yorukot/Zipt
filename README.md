# Zipt URL Shortener

A robust URL shortening service with analytics tracking built with Go and Gin.

## Features

- **URL Shortening**: Generate short URLs for long links
- **Custom Short Codes**: Registered users can create custom short codes
- **Analytics Tracking**: Track click counts, browser information, and referrers
- **User Authentication**: JWT-based user authentication
- **API Support**: RESTful API for programmatic access
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Proxy Support**: Works behind reverse proxies like Nginx

## Tech Stack

- **Backend**: Go with Gin framework
- **Database**: Flexible support for PostgreSQL, MySQL, MariaDB, or SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Structured logging with Zap
- **Frontend**: Next.js with TypeScript
- **Container**: Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Nginx or other reverse proxy

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/zipt.git
   cd zipt
   ```

2. Configure environment variables:
   ```bash
   cp template.env .env
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Manual Installation

If you prefer to run without Docker:

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

### Setting Up Behind a Reverse Proxy

#### Using Nginx

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create a new Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/zipt
   ```

3. Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Short URL redirects
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/zipt /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Update your environment variables in `.env`:
   ```
   BACKEND_URL=https://your-domain.com/
   FRONTEND_URL=https://your-domain.com/
   SHORT_DOMAIN=your-domain.com
   COOKIE_DOMAIN=your-domain.com
   ```

6. Update the frontend environment in `docker-compose.yml`:
   ```yaml
   website:
     environment:
       - NEXT_PUBLIC_API_URL=https://your-domain.com/api
   ```

7. Restart your Docker containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### SSL Configuration (Recommended)

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Get SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. Certbot will automatically modify your Nginx configuration to include SSL settings.

## API Documentation

See [API Documentation](docs/api.md) for detailed information on available endpoints.

### Quick Examples

#### Create a Short URL (Anonymous)

```bash
curl -X POST https://your-domain.com/api/v1/url \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://example.com/very/long/url"
  }'
```

#### Create a Short URL with Custom Code (Authenticated)

```bash
curl -X POST https://your-domain.com/api/v1/url \
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
├── website/             # Frontend Next.js application
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
- [Next.js](https://nextjs.org/) for the frontend framework
- All other open-source packages used in this project
