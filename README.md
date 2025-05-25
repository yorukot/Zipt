# Zipt - Modern URL Shortener

A comprehensive URL shortening service with advanced analytics, workspace management, and custom domain support. Built with Go (Gin) backend and Next.js frontend.

## ✨ Features

### Core Features
- **URL Shortening**: Generate short URLs for long links with custom short codes
- **Analytics Dashboard**: Comprehensive analytics with click tracking, geographic data, device information, and referrer statistics
- **Workspace Management**: Multi-workspace support for team collaboration
- **Custom Domains**: Add and verify custom domains for branded short links
- **User Authentication**: JWT-based authentication with secure session management
- **Team Collaboration**: Invite team members to workspaces with role-based access

### Advanced Features
- **Real-time Analytics**: Time-series data with interactive charts and visualizations
- **Geographic Tracking**: Country and city-level click analytics with flag icons
- **Device Analytics**: Browser, OS, and device type tracking
- **Internationalization**: Multi-language support (English, Traditional Chinese)
- **Dark/Light Theme**: Responsive design with theme switching
- **API Access**: RESTful API for programmatic URL management
- **Bulk Operations**: Manage multiple URLs efficiently

### Technical Features
- **Database Flexibility**: Support for PostgreSQL, MySQL, MariaDB, and SQLite
- **GeoIP Integration**: MaxMind GeoIP database for location tracking
- **S3 Integration**: AWS S3 support for file storage
- **OAuth Support**: Ready for OAuth authentication providers
- **Caching**: Built-in caching mechanisms for performance
- **Docker Support**: Complete containerization with Docker Compose
- **Reverse Proxy Ready**: Nginx and Caddy configuration support

## 🏗️ Architecture

### Backend (Go + Gin)
```
backend/
├── app/
│   ├── controllers/          # HTTP request handlers
│   │   ├── auth/            # Authentication controllers
│   │   ├── domain/          # Domain management
│   │   ├── shortener/       # URL shortening logic
│   │   ├── user/            # User management
│   │   └── workspace/       # Workspace operations
│   ├── models/              # Database models and schemas
│   ├── queries/             # Database query functions
│   └── routes/              # API route definitions
├── pkg/
│   ├── database/            # Database connection and migrations
│   ├── encryption/          # Encryption utilities
│   ├── geoip/              # GeoIP location services
│   ├── logger/             # Structured logging with Zap
│   ├── middleware/         # HTTP middleware (auth, CORS, logging)
│   ├── oauth/              # OAuth authentication providers
│   ├── s3/                 # AWS S3 integration
│   └── utils/              # Common utilities
├── static/                  # Static assets
└── main.go                 # Application entry point
```

### Frontend (Next.js + TypeScript)
```
website/
├── app/                     # Next.js App Router
│   ├── dashboard/          # Main dashboard application
│   │   └── [workspaceId]/  # Workspace-specific routes
│   │       ├── analytics/  # Analytics pages
│   │       └── settings/   # Workspace settings
│   ├── login/              # Authentication pages
│   ├── register/           # User registration
│   └── workspace/          # Workspace management
├── components/             # Reusable React components
│   ├── analytics/          # Analytics visualizations
│   ├── auth/               # Authentication forms
│   ├── dashboard/          # Dashboard components
│   ├── shortener/          # URL shortening interface
│   ├── ui/                 # Base UI components (shadcn/ui)
│   └── workspace/          # Workspace management
├── lib/                    # Utilities and configurations
│   ├── context/            # React context providers
│   └── utils/              # Helper functions
└── messages/               # Internationalization files
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Go 1.23+** (for manual installation)
- **Node.js 18+** (for manual installation)
- **PostgreSQL/MySQL/SQLite** (database)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yorukot/zipt.git
   cd zipt
   ```

2. **Configure environment variables**
   ```bash
   cp template.env .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/api/v1

### Option 2: Manual Installation

#### Backend Setup
```bash
cd backend
go mod download
cp template.env .env
# Configure your .env file
go run main.go
```

#### Frontend Setup
```bash
cd website
npm install
# or
pnpm install
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Backend Configuration
```env
# Server
VERSION=1
BASE_URL=http://localhost:8080/
PORT=8080
GIN_MODE=debug

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=zipt
DATABASE_PASSWORD=your_password
DATABASE_DBNAME=zipt
DATABASE_SSLMODE=disable

# Security
JWT_SECRET=your-super-secret-jwt-key
COOKIE_DOMAIN=localhost

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Optional: GeoIP
GEOIP_DATABASE_PATH=./data/GeoLite2-City.mmdb
```

#### Frontend Configuration
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_SHORT_DOMAIN=http://localhost:8080
NEXT_PUBLIC_LINKS_DOMAIN=localhost:8080
```

## 🔧 Development

### Backend Development
```bash
cd backend
go mod tidy
go run main.go
```

### Frontend Development
```bash
cd website
pnpm dev
```

### Database Migrations
The application automatically handles database migrations on startup using GORM.

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token

### URL Management
- `POST /api/v1/workspace/{id}/url` - Create short URL
- `GET /api/v1/workspace/{id}/url` - List URLs
- `PUT /api/v1/workspace/{id}/url/{urlId}` - Update URL
- `DELETE /api/v1/workspace/{id}/url/{urlId}` - Delete URL
- `GET /api/v1/workspace/{id}/url/{urlId}/analytics` - Get URL analytics

### Workspace Management
- `GET /api/v1/workspace` - List workspaces
- `POST /api/v1/workspace` - Create workspace
- `PUT /api/v1/workspace/{id}` - Update workspace
- `DELETE /api/v1/workspace/{id}` - Delete workspace
- `POST /api/v1/workspace/{id}/invite` - Invite user to workspace

### Example: Create Short URL
```bash
curl -X POST http://localhost:8080/api/v1/workspace/123/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "original_url": "https://example.com/very/long/url",
    "custom_slug": "my-link",
    "expires_at": "2024-12-31T23:59:59Z"
  }'
```

## 🌐 Deployment

### Production with Docker

1. **Update environment variables for production**
   ```env
   GIN_MODE=release
   BASE_URL=https://your-domain.com/
   FRONTEND_URL=https://your-domain.com/
   COOKIE_DOMAIN=your-domain.com
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Reverse Proxy Setup (Nginx)

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Short URL redirects
    location ~ ^/[a-zA-Z0-9]+$ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🎨 Features Overview

### Dashboard
- **Workspace Overview**: Total links, clicks, and performance metrics
- **Recent Links**: Quick access to recently created URLs
- **Analytics Summary**: Key performance indicators and trends

### Analytics
- **Time Series Charts**: Click trends over time with customizable periods
- **Geographic Analytics**: Country and city-level click distribution
- **Device Analytics**: Browser, OS, and device type breakdown
- **Referrer Tracking**: Traffic source analysis
- **Real-time Updates**: Live analytics with automatic refresh

### Workspace Management
- **Multi-workspace Support**: Organize URLs by project or team
- **Team Collaboration**: Invite members with role-based permissions
- **Custom Domains**: Brand your short links with custom domains
- **Domain Verification**: DNS-based domain ownership verification

### User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Automatic theme detection with manual override
- **Internationalization**: Support for multiple languages
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠️ Tech Stack

### Backend
- **Framework**: Gin (Go web framework)
- **Database**: GORM with PostgreSQL/MySQL/SQLite support
- **Authentication**: JWT with secure cookie storage
- **Logging**: Structured logging with Zap
- **GeoIP**: MaxMind GeoLite2 database
- **File Storage**: AWS S3 integration
- **Caching**: Built-in caching layer

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: SWR for data fetching
- **Icons**: Lucide React and Iconify
- **Internationalization**: next-intl

### DevOps
- **Containerization**: Docker and Docker Compose
- **Reverse Proxy**: Nginx/Caddy support
- **SSL**: Let's Encrypt integration
- **Monitoring**: Structured logging and error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices for backend development
- Use TypeScript and follow React best practices for frontend
- Write tests for new features
- Update documentation for API changes
- Follow conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Gin](https://github.com/gin-gonic/gin) - HTTP web framework for Go
- [GORM](https://gorm.io/) - ORM library for Go
- [Next.js](https://nextjs.org/) - React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Composable charting library
- [MaxMind](https://www.maxmind.com/) - GeoIP database provider

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yorukot/zipt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yorukot/zipt/discussions)

---

**Zipt** - Making long URLs short and analytics simple. 🚀
