# Deploying Zipt on Coolify Guide

This guide will help you deploy the Zipt URL shortener service on the Coolify platform.

## Prerequisites

1. A running Coolify instance
2. Access to your Git repository containing the Zipt codebase
3. An available domain name (for the Zipt service)

## Deployment Steps

### 1. Add Your Resources in Coolify

First, ensure you have set up in Coolify:
- A valid Source - typically your Git repository
- A target Destination - your Coolify server or another remote server

### 2. Create a New Service

1. In the Coolify dashboard, click "New Service"
2. Select "Docker Compose"
3. Choose your Git repository as the source
4. Configure the service details:
   - Name: `zipt`
   - Branch: `main` (or your primary branch)
   - Build method: Docker Compose
   - Compose file path: `docker/zipt-coolify.yaml`

### 3. Configure Environment Variables

1. In the "Environment Variables" section of the service creation page
2. Fill in all necessary environment variables, or upload the `zipt-coolify-env.txt` file
3. Ensure you configure at least these variables:
   - `BASE_URL`: Your Zipt domain (e.g., https://zipt.example.com)
   - `API_URL`: API endpoint (e.g., https://zipt.example.com/api)
   - `COOLIFY_DOMAIN`: Your domain name without protocol (e.g., zipt.example.com)
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database name
   - `REDIS_PASSWORD`: Redis password
   - `JWT_SECRET`: Secure key for JWT tokens

### 4. Configure Domain

1. In the "Domains" section, add your domain
2. Enable HTTPS (recommended)
3. Select "Auto-generate SSL certificate" (if available)

### 5. Deploy the Service

1. Click "Create Service" or "Deploy"
2. Coolify will start the build and deployment process
3. Wait for the deployment to complete

### 6. Verify Deployment

1. After deployment completes, visit your configured domain
2. Ensure the Zipt application is running properly
3. Test creating short links and redirection functionality

## Troubleshooting

If you encounter issues:

1. Check Coolify logs for error details
2. Ensure all environment variables are correctly set
3. Verify your domain DNS settings are properly pointing to the Coolify server

### Common Issues

#### GIT_REPOSITORY_ROOT_PATH Error

If you see an error like this:
```
The "GIT_REPOSITORY_ROOT_PATH" variable is not set. Defaulting to a blank string.
unable to prepare context: path "/website" not found
```

This is because Coolify cannot find the correct paths in your repository. The solution is:

1. Use relative paths in your Docker Compose file
2. For the backend context, use `.` instead of `${GIT_REPOSITORY_ROOT_PATH}`
3. For the website context, use `./website` instead of `${GIT_REPOSITORY_ROOT_PATH}/website`
4. For volume mounts, use relative paths like `./docker/nginx/nginx.coolify.conf`

#### Other Common Issues

- **Database connection errors**: Ensure database credentials are correct
- **Cannot access application**: Check Nginx configuration and domain settings
- **Build failures**: Check Docker build logs and Dockerfile configuration

## Updating Your Deployment

When you need to update your application:

1. Commit changes to your Git repository
2. In the Coolify dashboard, find your Zipt service
3. Click "Redeploy" or set up automatic deployment hooks

## Backups

Regularly back up your data:

1. In Coolify, you can set up backup strategies for the PostgreSQL database
2. Consider exporting data and storing it in a secure external location

## Conclusion

You've now successfully deployed the Zipt URL shortening service on Coolify. You can leverage all the features Coolify provides, such as automatic deployment, monitoring, and notifications to manage your application. 