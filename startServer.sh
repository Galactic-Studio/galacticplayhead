#!/bin/bash

GAME_ID=$1
PORT=$2
GAMESERVER_PORT=$3

cd servers/"$GAME_ID"-"$PORT" || exit

exec > startLog.out 2>&1

echo "Starting Server System"

# Update UFW rules
echo "Updating UFW rules..."
sudo ufw allow "$PORT"/tcp
sudo ufw allow "$GAMESERVER_PORT"/udp
echo "UFW rules updated."

# Configure Nginx to proxy requests to your Express app
echo "Configuring Nginx..."
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
sed -i "/location \/ {/,/}/ s/proxy_pass http:\/\/localhost:[0-9]*;/proxy_pass http:\/\/localhost:$EXPRESS_PORT;/" /etc/nginx/sites-available/default

# Check Nginx configuration and restart Nginx
sudo nginx -t && sudo systemctl restart nginx
echo "Nginx configured and restarted."

npm install

pm2 start index.js --name "$PORT" -- "$PORT" "$GAMESERVER_PORT" "$GAME_ID"

echo "Server is ready and running."