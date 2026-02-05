# Quick Reference - Nginx & SSL Setup

## ✅ What's Working Now

1. **Nginx** is installed and running
2. **Domain configured**: palash.club
3. **HTTP accessible** (port 80)
4. **Reverse proxy** working:
   - Frontend → `http://localhost:3000`
   - Backend API → `http://localhost:8080`

## ⚠️ SSL Certificate Status

**Status**: Pending - Requires DNS verification

**Issue**: Let's Encrypt cannot verify domain ownership because the domain is not properly pointing to this server or there's a connectivity issue.

## 🔧 What You Need to Do

### Step 1: Verify DNS Configuration

Check if your domain DNS is pointing to your server:

```bash
# Check current DNS
dig +short palash.club A

# Should show your server's IP address
```

**Current DNS**: `72.62.226.231`

### Step 2: Update DNS Records (If Needed)

If the DNS is not pointing to your server:

1. Log into your domain registrar (where you bought palash.club)
2. Go to DNS settings
3. Add/Update A records:
   - **Host**: `@` → **Points to**: Your Server IPv4
   - **Host**: `www` → **Points to**: Your Server IPv4

### Step 3: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Check propagation: https://dnschecker.org

### Step 4: Get SSL Certificate

Once DNS is correct, run:

```bash
cd /root/palash-app
sudo certbot --nginx -d palash.club -d www.palash.club
```

Or use the automated script:

```bash
cd /root/palash-app
sudo ./setup-ssl.sh
```

### Step 5: Update Environment Variables

After SSL is working, update the API URL:

**File**: `/root/palash-app/apps/web/.env`

Change:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

To:
```env
NEXT_PUBLIC_API_URL=https://palash.club/api
```

Then restart:
```bash
pm2 restart all
```

## 📋 Quick Commands

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/palash.club.error.log

# Check SSL certificates
sudo certbot certificates

# Renew SSL (dry run)
sudo certbot renew --dry-run

# PM2 status
pm2 status

# PM2 logs
pm2 logs
```

## 🌐 Current Access URLs

**While SSL is pending:**
- Frontend: http://palash.club
- Backend: http://palash.club/api/

**After SSL setup:**
- Frontend: https://palash.club
- Backend: https://palash.club/api/

## 📚 Full Documentation

- **PM2 Setup**: `/root/palash-app/PM2_SETUP.md`
- **Nginx Details**: `/root/palash-app/NGINX_SETUP.md`
- **SSL Script**: `/root/palash-app/setup-ssl.sh`

## 🆘 Need Help?

If SSL setup fails, check:
1. DNS points to correct IP: `dig +short palash.club`
2. Server IP: `curl -4 ifconfig.me`
3. Nginx running: `sudo systemctl status nginx`
4. Ports open: `sudo ufw status`
5. Logs: `sudo tail -50 /var/log/letsencrypt/letsencrypt.log`
