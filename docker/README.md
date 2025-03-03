# Zipt Docker Setup

This directory contains Docker configurations for both development and production environments.

## Development Setup

To run the development environment:

1. Make sure Docker and Docker Compose are installed on your system
2. Run the development environment:

```bash
docker-compose -f docker-develop-compose.yml up
```

The development environment includes:
- Hot-reloading for both backend (using Air) and frontend (Next.js dev server)
- PostgreSQL and Redis for data storage
- Nginx as a reverse proxy

## Production Setup

For production deployment, follow these steps:

1. Copy the `.env.example` file to `.env` and update the variables:

```bash
cp .env.example .env
```

2. Set up SSL certificates with Let's Encrypt:

```bash
# Create directories for Let's Encrypt
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# Start nginx for initial certificate setup
docker-compose -f docker-production-compose.yml up nginx
```

3. Obtain the initial SSL certificate:

```bash
docker-compose -f docker-production-compose.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot/ -d yourdomain.com -d www.yourdomain.com
```

4. Start the full production stack:

```bash
docker-compose -f docker-production-compose.yml up -d
```

5. Check that all services are running:

```bash
docker-compose -f docker-production-compose.yml ps
```

## Configuration Files

- `docker-develop-compose.yml`: Development environment configuration
- `docker-production-compose.yml`: Production environment configuration
- `nginx/nginx.conf`: Nginx configuration for development
- `nginx/nginx.prod.conf`: Nginx configuration for production
- `Dockerfile.backend`: Production Dockerfile for the Go backend
- `Dockerfile.website`: Production Dockerfile for the Next.js frontend

## Updating SSL Certificates

Let's Encrypt certificates need to be renewed every 90 days. This happens automatically with the Certbot service, which attempts renewal every 12 hours.

To manually trigger a renewal:

```bash
docker-compose -f docker-production-compose.yml run --rm certbot renew
```

## Scaling

For higher traffic scenarios, consider implementing a more complex orchestration using Kubernetes or Docker Swarm.
