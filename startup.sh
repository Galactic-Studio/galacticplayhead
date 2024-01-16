#!/bin/bash

# Set the HOME environment variable
export HOME=/home/root

exec > ~/startLog.out 2>&1

# Configure Nginx to proxy requests to Galactic Studio
EXPRESS_PORT=8080

# Backup the original Nginx config file
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

sed -i "/location \/ {/,/}/ s/proxy_pass http:\/\/localhost:[0-9]*;/proxy_pass http:\/\/localhost:8080;/" /etc/nginx/sites-available/default
sed -i "s|root .*;|root /var/www/server;|" /etc/nginx/sites-available/default


# Check Nginx configuration and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

adduser --disabled-password --gecos "" dataserver
usermod -aG sudo dataserver

# Start the application using PM2
pm2 start main.js

echo Head Server Is Ready and running