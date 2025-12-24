# Docker Setup Guide

## Quick Start

### Development with Docker

**1. Using Docker Compose (Recommended)**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**2. Using Docker directly**

```bash
# Build image
docker build -t eduassess-backend .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./eduassess.db \
  -e SECRET_KEY=your-secret-key \
  eduassess-backend
```

## Services

### Development Stack (`docker-compose.yml`)

- **Backend API**: http://localhost:8000

  - Auto-reload enabled
  - SQLite or PostgreSQL database
  - API docs: http://localhost:8000/docs

- **PostgreSQL**: localhost:5432

  - User: eduassess
  - Password: eduassess123
  - Database: eduassess

- **PgAdmin** (Optional): http://localhost:5050
  - Email: admin@eduassess.com
  - Password: admin
  - Enable with: `docker-compose --profile tools up -d`

### Production Stack (`docker-compose.prod.yml`)

- **Backend API**: Port 8000 (behind Nginx)
- **PostgreSQL**: Production database
- **Nginx** (Optional): Reverse proxy with SSL
  - Enable with: `docker-compose -f docker-compose.prod.yml --profile with-nginx up -d`

## Configuration

### Environment Variables

Create a `.env` file or use `.env.docker`:

```bash
# Copy example file
cp .env.docker .env

# Edit configuration
nano .env
```

**Required Variables:**

- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT signing key (min 32 characters)
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins

**Optional Variables:**

- `DEBUG` - Enable debug mode (default: True)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration (default: 30)
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database credentials

## Commands

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Execute commands in container
docker-compose exec backend python -m app.db.seed
docker-compose exec backend python -m pytest

# Restart services
docker-compose restart backend

# Stop services
docker-compose stop

# Remove containers and volumes
docker-compose down -v

# Rebuild after code changes
docker-compose build backend
docker-compose up -d --no-deps --build backend
```

### Docker Commands

```bash
# Build image
docker build -t eduassess-backend .

# Build with no cache
docker build --no-cache -t eduassess-backend .

# Run container
docker run -d -p 8000:8000 --name backend eduassess-backend

# View logs
docker logs -f backend

# Execute command
docker exec -it backend python -m app.db.seed

# Stop container
docker stop backend

# Remove container
docker rm backend

# Remove image
docker rmi eduassess-backend
```

## Database Management

### Initialize Database

```bash
# Using docker-compose
docker-compose exec backend python -m app.db.init_db

# Using docker
docker exec -it eduassess_backend python -m app.db.init_db
```

### Seed Sample Data

```bash
# Using docker-compose
docker-compose exec backend python -m app.db.seed

# Using docker
docker exec -it eduassess_backend python -m app.db.seed
```

### Database Backup (PostgreSQL)

```bash
# Backup
docker-compose exec postgres pg_dump -U eduassess eduassess > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U eduassess eduassess

# Backup to file inside container
docker-compose exec postgres pg_dump -U eduassess -F c eduassess -f /backups/backup_$(date +%Y%m%d).dump
```

### Access PostgreSQL CLI

```bash
# Using docker-compose
docker-compose exec postgres psql -U eduassess eduassess

# Using docker
docker exec -it eduassess_db psql -U eduassess eduassess
```

## Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd backend

# Copy environment file
cp .env.docker .env

# Start services
docker-compose up -d

# Initialize and seed database
docker-compose exec backend python -m app.db.init_db
docker-compose exec backend python -m app.db.seed
```

### 2. Making Changes

```bash
# Code changes are auto-reloaded
# Edit files in your IDE

# View logs
docker-compose logs -f backend

# Run tests
docker-compose exec backend pytest tests/ -v
```

### 3. Database Changes

```bash
# Stop services
docker-compose down -v

# Start fresh
docker-compose up -d

# Re-initialize
docker-compose exec backend python -m app.db.init_db
docker-compose exec backend python -m app.db.seed
```

## Production Deployment

### 1. Build Production Image

```bash
# Build production image
docker build -f Dockerfile.prod -t eduassess-backend:prod .

# Or with docker-compose
docker-compose -f docker-compose.prod.yml build
```

### 2. Configure Environment

```bash
# Create production .env file
cat > .env.prod << EOF
DATABASE_URL=postgresql://user:password@postgres:5432/eduassess
SECRET_KEY=$(openssl rand -hex 32)
DEBUG=False
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
EOF
```

### 3. Start Production Stack

```bash
# Start with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# With Nginx reverse proxy
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

### 4. Monitor

```bash
# Check health
curl http://localhost:8000/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check resource usage
docker stats
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild container
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Database connection issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection
docker-compose exec backend python -c "from app.db.database import engine; engine.connect()"
```

### Port already in use

```bash
# Find process using port 8000
# Windows PowerShell:
netstat -ano | findstr :8000

# Linux/macOS:
lsof -i :8000

# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Host:Container
```

### Clean slate

```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Remove all images
docker rmi $(docker images -q eduassess*)

# Start fresh
docker-compose up -d --build
```

## Best Practices

### Development

- Use `docker-compose.yml` for local development
- Keep `.env` file in `.gitignore`
- Use volume mounts for live code reloading
- Enable debug mode for better error messages

### Production

- Use `docker-compose.prod.yml` for production
- Use `Dockerfile.prod` with multi-stage builds
- Set strong `SECRET_KEY` (32+ random characters)
- Disable debug mode (`DEBUG=False`)
- Use environment-specific configurations
- Enable health checks
- Set restart policies
- Use non-root user in container
- Implement proper logging
- Regular database backups

### Security

- Never commit `.env` files
- Use secrets management for sensitive data
- Keep images updated
- Scan images for vulnerabilities
- Use SSL/TLS in production
- Implement rate limiting
- Enable CORS only for trusted origins

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Documentation](https://fastapi.tiangolo.com/deployment/docker/)
- [PostgreSQL Docker Documentation](https://hub.docker.com/_/postgres)

## Sample Credentials (After Seeding)

- **Admin**: admin@eduassess.com / admin123
- **Teacher**: teacher@eduassess.com / teacher123
- **Student**: student@eduassess.com / student123

## Health Check

```bash
# Check API health
curl http://localhost:8000/health

# Expected response
{"status":"healthy"}
```

## API Documentation

Once running, access interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

Happy Dockerizing! 🐳
