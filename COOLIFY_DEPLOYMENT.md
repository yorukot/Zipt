# Zipt URL Shortener - Coolify Deployment Guide

This guide will help you deploy the Zipt URL shortener application using Coolify, a self-hosted alternative to Heroku and Netlify.

## 📋 Prerequisites

- A server with Coolify installed and configured
- A domain name with DNS access
- Basic knowledge of Docker and environment variables

## 🚀 Quick Deployment

### Step 1: Create a New Project in Coolify

1. Log into your Coolify dashboard
2. Click "New Project"
3. Choose "Docker Compose" as the deployment type
4. Connect your Git repository containing this project

### Step 2: Configure Environment Variables

Copy the variables from `coolify.env.example` and configure them in Coolify:

#### Required Variables

```env
# Domain Configuration
DOMAIN=your-domain.com
SHORT_DOMAIN=short.example.com
ACME_EMAIL=admin@example.com

# Security
JWT_SECRET_KEY=your_super_secret_jwt_key_here_make_it_long_and_random
DATABASE_PASSWORD=your_secure_database_password_here

# Application URLs
BASE_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_API_SHORT_DOMAIN=https://short.example.com
NEXT_PUBLIC_LINKS_DOMAIN=short.example.com

# Cookie Configuration
COOKIE_DOMAIN=your-domain.com
```

### Step 3: DNS Configuration

Set up the following DNS records:

#### For Main Domain (your-domain.com)
```
Type: A
Name: @
Value: [Your Server IP]
TTL: 300
```

#### For Short Domain (short.example.com)
```
Type: A
Name: short
Value: [Your Server IP]
TTL: 300
```

### Step 4: Deploy

1. Click "Deploy" in Coolify
2. Wait for the build and deployment process to complete
3. Monitor the logs for any issues

## 🔧 Advanced Configuration

### Custom Domains

If you want to use custom domains:

1. Update the `DOMAIN` and `SHORT_DOMAIN` variables
2. Ensure DNS records point to your server
3. Coolify will automatically handle SSL certificates via Let's Encrypt

### Database Configuration

The setup includes TimescaleDB by default. For external database:

1. Remove the `database` service from docker-compose.yml
2. Update these environment variables:
   ```env
   DATABASE_HOST=your-external-db-host
   DATABASE_PORT=5432
   DATABASE_USER=your-db-user
   DATABASE_PASSWORD=your-db-password
   DATABASE_DBNAME=your-db-name
   DATABASE_SSLMODE=require
   ```



### Email Configuration (Optional)

For email notifications and user management:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@your-domain.com
```

### AWS S3 Configuration (Optional)

For file storage:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
```

## 🏗️ Architecture Overview

The deployment includes:

- **Frontend**: Next.js application (port 3000)
- **Backend**: Go/Gin API server (port 8080)
- **Database**: TimescaleDB (PostgreSQL 17 with time-series extensions)
- **Proxy**: Caddy 2.7 with automatic HTTPS

## 🔍 Health Checks

The application includes health checks for all services:

- **Backend**: `GET /api/v1/health`
- **Frontend**: `GET /`
- **Database**: TimescaleDB ready check

## 📊 Monitoring and Logs

### Accessing Logs

In Coolify dashboard:
1. Go to your project
2. Click on "Logs" tab
3. Select the service you want to monitor

### Log Locations

- **Application Logs**: Available through Coolify interface
- **Caddy Access Logs**: `/var/log/caddy/access.log`
- **Caddy Short URL Logs**: `/var/log/caddy/short_access.log`

## 🔒 Security Considerations

### SSL/TLS

- Automatic HTTPS via Let's Encrypt
- HSTS headers enabled
- Secure cookie configuration

### Security Headers

The Caddy configuration includes:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

### Database Security

- Database is not exposed externally
- Strong password requirements
- Connection pooling configured

## 🚨 Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check Caddy logs
docker logs zipt-proxy

# Verify DNS records
dig your-domain.com
dig short.example.com
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker logs zipt-database

# Verify database is running
docker exec zipt-database pg_isready -U zipt
```

#### 3. Backend API Issues
```bash
# Check backend logs
docker logs zipt-backend

# Test API endpoint
curl https://your-domain.com/api/v1/health
```

#### 4. Frontend Issues
```bash
# Check frontend logs
docker logs zipt-website

# Verify frontend is running
curl http://localhost:3000
```

### Performance Optimization

#### Database Optimization
```env
# Increase connection pool for high traffic
DATABASE_MAX_OPEN_CONNS=200
DATABASE_MAX_IDLE_CONNS=50
```



## 📈 Scaling

### Horizontal Scaling

For high-traffic deployments:

1. **Load Balancer**: Use Coolify's load balancing features
2. **Database**: Consider TimescaleDB clustering or managed TimescaleDB service
3. **CDN**: Add CloudFlare or similar CDN for static assets

### Vertical Scaling

Adjust resource limits in Coolify:
- CPU limits
- Memory limits
- Storage allocation

## 🔄 Updates and Maintenance

### Updating the Application

1. Push changes to your Git repository
2. Coolify will automatically detect changes
3. Deploy the new version
4. Monitor logs for any issues

### Database Migrations

The application handles database migrations automatically on startup.

### Backup Strategy

1. **Database Backups**: Configure automatic TimescaleDB backups
2. **Volume Backups**: Backup Docker volumes regularly
3. **Configuration Backups**: Keep environment variables backed up

## 📞 Support

### Getting Help

- **Documentation**: Check the main README.md
- **Issues**: Create GitHub issues for bugs
- **Community**: Join discussions for questions

### Monitoring

Set up monitoring for:
- Application uptime
- Database performance
- SSL certificate expiration
- Disk space usage
- Memory and CPU usage

## 🎯 Production Checklist

Before going live:

- [ ] Strong passwords for all services
- [ ] Proper domain configuration
- [ ] DNS records configured
- [ ] SSL certificates working
- [ ] Health checks passing
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance testing completed
- [ ] Error handling tested

## 📝 Environment Variables Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Main domain | `zipt.example.com` |
| `SHORT_DOMAIN` | Short URL domain | `short.example.com` |
| `DATABASE_PASSWORD` | Database password | `secure_password_123` |
| `JWT_SECRET_KEY` | JWT signing key | `your_secret_key_here` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GIN_MODE` | Gin framework mode | `release` |
| `DATABASE_MAX_OPEN_CONNS` | Max DB connections | `100` |

---

**Happy Deploying! 🚀**

For more information, check the main [README.md](README.md) file. 