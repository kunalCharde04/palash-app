# Auto-Start Configuration - Palash.club

## ✅ Setup Complete

All services are now configured to **run in the background** and **auto-start on server reboot**.

---

## Services Configured

### 1. **Nginx Web Server**
- **Status**: ✅ Enabled to start on boot
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Auto-restart**: Yes
- **Check status**: `sudo systemctl status nginx`
- **Manual control**:
  ```bash
  sudo systemctl start nginx
  sudo systemctl stop nginx
  sudo systemctl restart nginx
  ```

### 2. **PM2 Process Manager** (Backend + Frontend)
- **Status**: ✅ Enabled to start on boot
- **Service**: `pm2-root.service`
- **Manages**:
  - `palash-server` (Backend API on port 8080)
  - `palash-web` (Frontend on port 3000)
- **Auto-restart**: Yes (PM2 auto-restarts crashed processes)
- **Check status**: `sudo pm2 status`
- **View logs**: `sudo pm2 logs`
- **Manual control**:
  ```bash
  sudo pm2 restart all
  sudo pm2 stop all
  sudo pm2 start all
  ```

### 3. **Docker Containers**
- **Status**: ✅ Docker service enabled, containers set to auto-restart
- **Containers**:
  - `palash-postgres` (PostgreSQL database on port 5432)
  - `palash-redis` (Redis cache on port 6379)
- **Restart Policy**: `always` (will restart on boot)
- **Check status**: `sudo docker ps`
- **Manual control**:
  ```bash
  sudo docker start palash-postgres palash-redis
  sudo docker stop palash-postgres palash-redis
  sudo docker restart palash-postgres palash-redis
  ```

---

## What Happens After Reboot?

1. **Docker** starts automatically
2. **PostgreSQL** and **Redis** containers start
3. **Nginx** starts and begins accepting connections
4. **PM2** resurrects saved process list
5. **Backend API** and **Frontend** start via PM2
6. **Site becomes accessible** at https://palash.club

---

## Verification Commands

### Check All Services Status
```bash
# Check nginx
sudo systemctl status nginx

# Check PM2 service
sudo systemctl status pm2-root

# Check PM2 apps
sudo pm2 status

# Check Docker containers
sudo docker ps

# Check Docker service
sudo systemctl status docker
```

### Check if Services are Enabled for Auto-Start
```bash
sudo systemctl is-enabled nginx
sudo systemctl is-enabled docker
sudo systemctl is-enabled pm2-root
```

All should return: `enabled`

---

## Testing the Setup

### Test Server Reboot (Optional)
```bash
# Save current state
sudo pm2 save

# Reboot server
sudo reboot

# After reboot, wait 2-3 minutes and check:
sudo pm2 status
sudo docker ps
curl https://palash.club
```

### Test from Outside
From any computer:
```bash
curl https://palash.club
# Should return 200 OK
```

---

## Monitoring

### View Real-Time Logs
```bash
# PM2 logs (all apps)
sudo pm2 logs

# Backend logs only
sudo pm2 logs palash-server

# Frontend logs only
sudo pm2 logs palash-web

# Nginx access logs
sudo tail -f /var/log/nginx/palash.club.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/palash.club.error.log

# Docker logs
sudo docker logs -f palash-postgres
sudo docker logs -f palash-redis
```

---

## Important Notes

1. **You can safely close your SSH terminal** - Everything will keep running
2. **Server reboots are handled** - All services restart automatically
3. **Process crashes are handled** - PM2 auto-restarts crashed apps
4. **PM2 process list is saved** - Changes persist across reboots

---

## Saved Process List Location
- PM2 dump file: `/root/.pm2/dump.pm2`
- PM2 logs: `/root/.pm2/logs/`
- Application logs: 
  - Backend: `/root/palash-app/apps/server/logs/`
  - Frontend: `/root/palash-app/apps/web/logs/`

---

## Quick Reference

| Service | Port | Status Command | Restart Command |
|---------|------|----------------|-----------------|
| Nginx | 80, 443 | `sudo systemctl status nginx` | `sudo systemctl restart nginx` |
| Backend API | 8080 | `sudo pm2 status` | `sudo pm2 restart palash-server` |
| Frontend | 3000 | `sudo pm2 status` | `sudo pm2 restart palash-web` |
| PostgreSQL | 5432 | `sudo docker ps` | `sudo docker restart palash-postgres` |
| Redis | 6379 | `sudo docker ps` | `sudo docker restart palash-redis` |

---

## Troubleshooting

### If a service doesn't start after reboot:

**Nginx:**
```bash
sudo systemctl status nginx
sudo systemctl start nginx
```

**PM2:**
```bash
sudo systemctl status pm2-root
sudo systemctl start pm2-root
sudo pm2 resurrect
```

**Docker containers:**
```bash
sudo docker start palash-postgres palash-redis
```

---

## Configuration Files

- Nginx: `/etc/nginx/sites-available/palash.club`
- PM2 Ecosystem: `/root/palash-app/ecosystem.config.js`
- PM2 Service: `/etc/systemd/system/pm2-root.service`
- Docker Compose: `/root/palash-app/docker-compose.yml`
- Frontend .env: `/root/palash-app/apps/web/.env`

---

**Setup Date**: February 4, 2026  
**Status**: ✅ All services configured and running in background

**You can now safely close your terminal - the site will keep running!** 🚀
