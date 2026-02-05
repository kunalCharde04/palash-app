# Nginx Setup Documentation for palash.club

## Current Status

✅ **Nginx installed and configured**
✅ **Reverse proxy setup for frontend (port 3000) and backend (port 8080)**
⚠️ **SSL certificate pending** (requires DNS verification)

## What's Been Done

### 1. Nginx Installation
- Nginx 1.24.0 installed
- Certbot installed for SSL certificates
- Service enabled and running

### 2. Configuration Created
- **Config file**: `/etc/nginx/sites-available/palash.club`
- **Symlink**: `/etc/nginx/sites-enabled/palash.club`
- **Logs**: `/var/log/nginx/palash.club.*.log`

### 3. Proxy Setup
The Nginx configuration routes traffic as follows:

| URL Path | Proxies To | Description |
|----------|------------|-------------|
| `/` | `http://localhost:3000` | Next.js frontend |
| `/api/` | `http://localhost:8080/` | Backend API |
| `/ws` | `http://localhost:8080` | WebSocket connections |

### 4. Ports Opened
- Port 80 (HTTP)
- Port 443 (HTTPS)

## DNS Configuration Required

**IMPORTANT**: Before SSL will work, ensure your DNS is configured correctly:

### Check Current DNS
```bash
dig +short palash.club A
```

Current resolution: `72.62.226.231`

### Required DNS Records

Add these A records in your domain registrar's DNS settings:

```
A Record:
  Host: @
  Value: <YOUR_SERVER_IPv4>
  TTL: 300 (or automatic)

A Record:
  Host: www
  Value: <YOUR_SERVER_IPv4>
  TTL: 300 (or automatic)
```

### Get Your Server IP
```bash
# IPv4
curl -4 ifconfig.me

# IPv6
curl -6 ifconfig.me
```

## SSL Certificate Installation

### Option 1: Automatic SSL Setup (When DNS is Ready)
Once your domain DNS is pointing to this server, run:

```bash
cd /root/palash-app
sudo ./setup-ssl.sh
```

### Option 2: Manual SSL Setup
```bash
sudo certbot --nginx -d palash.club -d www.palash.club
```

This will:
1. Verify domain ownership
2. Obtain SSL certificates from Let's Encrypt
3. Automatically update Nginx configuration
4. Enable HTTPS redirect
5. Set up auto-renewal

### Verify SSL Installation
After successful SSL setup:

```bash
# Check certificate
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check HTTPS
curl -I https://palash.club
```

## Current URLs

### Development (HTTP - Current)
- **Frontend**: http://palash.club
- **Backend API**: http://palash.club/api/
- **WebSocket**: ws://palash.club/ws

### Production (HTTPS - After SSL)
- **Frontend**: https://palash.club
- **Backend API**: https://palash.club/api/
- **WebSocket**: wss://palash.club/ws

## Nginx Management Commands

### Service Control
```bash
# Restart Nginx
sudo systemctl restart nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx

# Reload configuration (no downtime)
sudo systemctl reload nginx
```

### Configuration Testing
```bash
# Test configuration syntax
sudo nginx -t

# Test and reload if successful
sudo nginx -t && sudo systemctl reload nginx
```

### View Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/palash.club.access.log

# Error logs
sudo tail -f /var/log/nginx/palash.club.error.log

# All Nginx errors
sudo tail -f /var/log/nginx/error.log
```

### Edit Configuration
```bash
# Edit site config
sudo nano /etc/nginx/sites-available/palash.club

# After editing, test and reload
sudo nginx -t && sudo systemctl reload nginx
```

## Environment Variables Update

After SSL is working, update your environment files:

### apps/web/.env
```env
# Change from http://localhost:8080 to:
NEXT_PUBLIC_API_URL=https://palash.club/api
```

### Restart Applications
```bash
cd /root/palash-app
pm2 restart all
```

## Troubleshooting

### SSL Certificate Issues

**Problem**: Certbot can't verify domain
```bash
# Check DNS
dig +short palash.club A
nslookup palash.club

# Verify Nginx is accessible
curl -I http://palash.club

# Check firewall
sudo ufw status

# Check Nginx logs
sudo tail -50 /var/log/nginx/error.log
```

**Problem**: Let's Encrypt timeout
- Ensure DNS points to correct server IP
- Wait for DNS propagation (up to 48 hours)
- Check if port 80 is accessible from internet
- Verify no other service is using port 80

### Nginx Issues

**Problem**: 502 Bad Gateway
```bash
# Check if backend is running
pm2 status
curl http://localhost:8080
curl http://localhost:3000

# Restart services
pm2 restart all
```

**Problem**: Configuration errors
```bash
# Test configuration
sudo nginx -t

# Check syntax errors in config file
sudo nano /etc/nginx/sites-available/palash.club
```

### DNS Propagation Check
```bash
# Check from different DNS servers
dig @8.8.8.8 palash.club A
dig @1.1.1.1 palash.club A

# Online tools
# https://dnschecker.org
# https://whatsmydns.net
```

## Certificate Auto-Renewal

Certbot automatically sets up a systemd timer for certificate renewal.

### Check renewal timer
```bash
sudo systemctl status certbot.timer
```

### Test renewal process
```bash
sudo certbot renew --dry-run
```

### Force renewal (if needed)
```bash
sudo certbot renew --force-renewal
```

## Security Enhancements (Optional)

### Enable HTTP/2
Already configured in the HTTPS block (after SSL setup)

### Add Security Headers
Already configured:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Rate Limiting (Optional)
Add to `/etc/nginx/nginx.conf` in http block:
```nginx
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

# Then in server block:
limit_req zone=mylimit burst=20;
```

## Next Steps

1. ✅ Verify DNS is pointing to this server
2. ⏳ Wait for DNS propagation (if just changed)
3. 🔒 Run SSL setup: `sudo ./setup-ssl.sh`
4. 🔧 Update environment variables to use HTTPS
5. 🔄 Restart PM2 applications
6. ✅ Test the site at https://palash.club

## Support

If you encounter issues:
1. Check Nginx error logs: `sudo tail -50 /var/log/nginx/error.log`
2. Check SSL logs: `sudo tail -50 /var/log/letsencrypt/letsencrypt.log`
3. Verify DNS: `dig +short palash.club A`
4. Check PM2 status: `pm2 status`
5. Test backend: `curl http://localhost:8080`
6. Test frontend: `curl http://localhost:3000`
