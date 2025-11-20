# 🐳 Docker Deployment Guide

## Quick Start

### 1. **Build and Run with Docker Compose**

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### 2. **Using Docker Directly**

```bash
# Build the image
docker build -t unify-push-web .

# Run the container
docker run -d \
  --name unify-push-web \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret-key \
  -e VITE_API_BASE_URL=http://localhost:3000 \
  unify-push-web

# View logs
docker logs -f unify-push-web

# Stop the container
docker stop unify-push-web
docker rm unify-push-web
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

**Important variables to configure:**

- `JWT_SECRET`: Secret key for JWT tokens (MUST change in production)
- `VITE_API_BASE_URL`: URL of your API backend
- `ADMIN_USERNAME`: Default admin username
- `ADMIN_PASSWORD`: Default admin password (change immediately)

## Production Deployment

### Using Docker Compose (Recommended)

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production values
   ```

2. **Build and start:**
   ```bash
   docker-compose up -d --build
   ```

3. **Check health:**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

### Using Docker Registry

1. **Build and tag:**
   ```bash
   docker build -t your-registry.com/unify-push-web:latest .
   ```

2. **Push to registry:**
   ```bash
   docker push your-registry.com/unify-push-web:latest
   ```

3. **Deploy on server:**
   ```bash
   docker pull your-registry.com/unify-push-web:latest
   docker run -d \
     --name unify-push-web \
     -p 3000:3000 \
     --env-file .env \
     --restart unless-stopped \
     your-registry.com/unify-push-web:latest
   ```

## Docker Image Features

- ✅ **Multi-stage build** - Optimized image size
- ✅ **Non-root user** - Security best practice
- ✅ **Health checks** - Automatic container monitoring
- ✅ **Production optimized** - Only production dependencies
- ✅ **Alpine Linux** - Minimal footprint (~150MB)

## Useful Commands

```bash
# View application logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Execute commands inside container
docker-compose exec app sh

# Remove all containers and volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Scale (if needed)
docker-compose up -d --scale app=3
```

## Monitoring

### Health Check Endpoint

The application includes a health check at `/health`:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

### Container Stats

```bash
# View resource usage
docker stats unify-push-web

# Using docker-compose
docker-compose stats
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows
```

### Application not responding

```bash
# Check health endpoint
curl http://localhost:3000/health

# Restart container
docker-compose restart app

# View detailed logs
docker-compose logs --tail=100 app
```

### Permission issues

```bash
# Check file ownership in container
docker-compose exec app ls -la

# If needed, rebuild
docker-compose down
docker-compose up -d --build
```

## Security Recommendations

1. **Change default credentials immediately**
   ```bash
   ADMIN_USERNAME=your-secure-username
   ADMIN_PASSWORD=your-secure-password
   ```

2. **Use strong JWT secret**
   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   ```

3. **Use environment-specific .env files**
   ```bash
   .env.development
   .env.staging
   .env.production
   ```

4. **Enable HTTPS** with reverse proxy (Nginx/Traefik)

5. **Regular updates**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t unify-push-web .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag unify-push-web your-registry.com/unify-push-web:latest
          docker push your-registry.com/unify-push-web:latest
```

## Support

For issues or questions, check:
- Application logs: `docker-compose logs -f`
- Container status: `docker-compose ps`
- Health endpoint: `curl http://localhost:3000/health`
