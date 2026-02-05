# Palash Wellness App - PM2 Setup Documentation

## Overview
This document describes the PM2 setup for running the Palash Wellness application.

## Services Running

### PM2 Managed Applications
1. **palash-server** - Backend API server
   - Port: 8080
   - Script: `./apps/server/dist/server.js`
   - Environment: Production
   - Logs: `./apps/server/logs/`

2. **palash-web** - Next.js frontend application
   - Port: 3000
   - Script: `npm start` in `./apps/web`
   - Environment: Production
   - Logs: `./apps/web/logs/`

### Docker Containers
1. **palash-postgres** - PostgreSQL Database
   - Image: postgres:16-alpine
   - Port: 5432
   - Database: palash_db
   - User: postgres
   - Password: palash

2. **palash-redis** - Redis Cache
   - Image: redis:7-alpine
   - Port: 6379

## PM2 Commands

### View Application Status
```bash
pm2 status
```

### View Logs
```bash
# All logs
pm2 logs

# Specific application
pm2 logs palash-server
pm2 logs palash-web

# Last N lines
pm2 logs --lines 50
```

### Restart Applications
```bash
# Restart all
pm2 restart all

# Restart specific
pm2 restart palash-server
pm2 restart palash-web
```

### Stop Applications
```bash
# Stop all
pm2 stop all

# Stop specific
pm2 stop palash-server
pm2 stop palash-web
```

### Start Applications
```bash
# Start from ecosystem file
pm2 start ecosystem.config.js

# Start specific
pm2 start palash-server
pm2 start palash-web
```

### Monitor Applications
```bash
pm2 monit
```

## Docker Commands

### View Container Status
```bash
docker ps
```

### View Container Logs
```bash
docker logs palash-postgres
docker logs palash-redis
```

### Stop Containers
```bash
docker stop palash-postgres palash-redis
```

### Start Containers
```bash
docker start palash-postgres palash-redis
```

### Remove Containers (WARNING: Data will be lost)
```bash
docker rm -f palash-postgres palash-redis
```

## Startup Configuration

PM2 has been configured to start automatically on system boot:
- Service: `pm2-root.service`
- Command to disable: `pm2 unstartup systemd`

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **WebSocket**: ws://localhost:8080

## Environment Variables

### Server (.env in apps/server/)
- NODE_ENV=development
- PORT=8080
- JWT_SECRET_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

### Web (.env in apps/web/)
- NEXT_PUBLIC_API_URL=http://localhost:8080
- NEXT_PUBLIC_RAZORPAY_KEY_ID
- NEXT_PUBLIC_RAZORPAY_KEY_SECRET

### Database (.env in packages/db-client/)
- DATABASE_URL="postgresql://postgres:palash@localhost:5432/palash_db?schema=public"

## Troubleshooting

### Application Not Starting
1. Check PM2 logs: `pm2 logs --err`
2. Verify containers are running: `docker ps`
3. Check environment variables are set correctly

### Database Connection Issues
1. Ensure PostgreSQL container is running: `docker ps | grep postgres`
2. Check database connection: `docker exec -it palash-postgres psql -U postgres -d palash_db`
3. Verify DATABASE_URL in packages/db-client/.env

### Redis Connection Issues
1. Ensure Redis container is running: `docker ps | grep redis`
2. Test Redis connection: `docker exec -it palash-redis redis-cli ping`

## Rebuilding the Application

If you make code changes:

```bash
# Build the project
npm run build

# Restart PM2 processes
pm2 restart all
```

## Complete Restart

To restart everything from scratch:

```bash
# Stop PM2 processes
pm2 stop all

# Restart Docker containers
docker restart palash-postgres palash-redis

# Wait a few seconds for containers to be ready
sleep 5

# Start PM2 processes
pm2 start all
```
