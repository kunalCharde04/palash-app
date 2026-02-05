#!/bin/bash

# SSL Setup Script for palash.club
# This script will obtain SSL certificates from Let's Encrypt using Certbot

echo "=========================================="
echo "SSL Certificate Setup for palash.club"
echo "=========================================="
echo ""

# Check if domain is accessible
echo "Checking if palash.club resolves to this server..."
DOMAIN_IP=$(dig +short palash.club A | tail -1)
echo "Domain resolves to: $DOMAIN_IP"
echo ""

# Get server IP
echo "Server IP addresses:"
ip -4 addr show | grep inet | grep -v '127.0.0.1'
echo ""

echo "IMPORTANT: Before proceeding, ensure that:"
echo "1. Domain palash.club points to this server's IP address"
echo "2. Ports 80 and 443 are open in the firewall"
echo "3. Nginx is running (sudo systemctl status nginx)"
echo ""

read -p "Do you want to proceed with SSL certificate installation? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Running Certbot..."
echo ""

# Run certbot
sudo certbot --nginx -d palash.club -d www.palash.club --non-interactive --agree-tos --redirect --email admin@palash.club

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "SUCCESS! SSL certificates have been installed"
    echo "=========================================="
    echo ""
    echo "Your site is now available at:"
    echo "  https://palash.club"
    echo "  https://www.palash.club"
    echo ""
    echo "Certificates will auto-renew via certbot timer"
    echo "Check renewal status: sudo certbot renew --dry-run"
else
    echo ""
    echo "=========================================="
    echo "ERROR: SSL certificate installation failed"
    echo "=========================================="
    echo ""
    echo "Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Firewall allows ports 80 and 443"
    echo "3. Nginx is running properly"
fi
