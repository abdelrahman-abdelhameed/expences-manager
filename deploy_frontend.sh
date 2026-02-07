#!/bin/bash

set -e  # Exit on error

echo "=========================================="
echo "Expense Manager Frontend Deployment"
echo "=========================================="

# Change to frontend directory
cd /run/media/abdelrahman/Work/expences/frontend

echo "[1/5] Installing dependencies..."
npm install

echo "[2/5] Building production bundle..."
npm run build

echo "[3/5] Installing Nginx (if not already installed)..."
sudo dnf install -y nginx > /dev/null 2>&1 || echo "Nginx already installed"

echo "[4/5] Configuring Nginx..."

# Stop Apache if running
sudo systemctl stop httpd 2>/dev/null || true
sudo systemctl disable httpd 2>/dev/null || true

# Create Nginx config
sudo tee /etc/nginx/conf.d/expense-app.conf > /dev/null << 'EOF'
server {
    listen 3000;
    server_name localhost;

    root /var/www/expense-app;
    index index.html;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api {
        proxy_pass http://localhost:8086;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ /\. {
        deny all;
    }
}
EOF

# Fix semicolon issue from heredoc
sudo sed -i 's/proxy_pass http:\/\/localhost:8086\\;/proxy_pass http:\/\/localhost:8086;/' /etc/nginx/conf.d/expense-app.conf

# Disable default Nginx server block
sudo sed -i '38,39s/listen/# listen/' /etc/nginx/nginx.conf

# Test Nginx config
sudo nginx -t > /dev/null 2>&1 || { echo "Nginx config test failed!"; exit 1; }

echo "[5/5] Deploying application..."

# Copy dist folder to Nginx accessible location
sudo rm -rf /var/www/expense-app
sudo cp -r /run/media/abdelrahman/Work/expences/frontend/dist /var/www/expense-app
sudo chown -R nginx:nginx /var/www/expense-app
sudo chmod -R 755 /var/www/expense-app

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx > /dev/null 2>&1

echo ""
echo "=========================================="
echo "✅ Deployment Successful!"
echo "=========================================="
echo ""
echo "Frontend URL: http://localhost:3000"
echo "Backend API: http://localhost:8086"
echo ""
echo "Services Status:"
sudo systemctl status nginx --no-pager | grep "Active:"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u nginx -f"
echo ""
echo "To restart services:"
echo "  sudo systemctl restart nginx"
echo "=========================================="

sudo dnf install nginx

sudo tee /etc/nginx/conf.d/expense-app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;

    root /run/media/abdelrahman/Work/expences/frontend/dist;
    index index.html;

    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback: route all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF
</parameter>
<parameter name="explanation">Create nginx configuration for the React app with API proxy</parameter>
<parameter name="isBackground">false</parameter>
</invoke>sudo tee /etc/nginx/conf.d/expense-app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name localhost;

    root /run/media/abdelrahman/Work/expences/frontend/dist;
    index index.html;

    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback: route all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF
</parameter>
<parameter name="explanation">Create nginx configuration for the React app with API proxy</parameter>
<parameter name="isBackground">false</parameter>
</invoke>