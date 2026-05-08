#!/bin/bash

ssh -i "C:\Users\sta\Desktop\chataffy-imp-data\chataffy-key1.pem" ubuntu@34.213.132.47 << 'EOF'

echo "========================================"
echo "Starting Superadmin Deployment..."
echo "========================================"

echo ""
echo "[1/9] Moving to project directory..."
cd /var/www/html/chataffy/superadmin || exit

echo ""
echo "[2/9] Current directory:"
pwd

echo ""
echo "[3/9] Fixing git safe directory..."
git config --global --add safe.directory /var/www/html/chataffy/superadmin

echo ""
echo "[4/9] Fixing project permissions..."
sudo chown -R ubuntu:ubuntu /var/www/html/chataffy/superadmin
sudo chmod -R 755 /var/www/html/chataffy/superadmin

echo ""
echo "[5/9] Checking Node version..."
node -v
npm -v

echo ""
echo "[6/9] Pulling latest code from GitHub..."
git pull

echo ""
echo "[7/9] Installing npm dependencies..."
npm install

echo ""
echo "[8/9] Building Vite production app..."
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production is missing on the server. Aborting build to avoid baking the wrong VITE_API_URL into the bundle."
  exit 1
fi
echo "Using VITE_API_URL from .env.production:"
grep -E '^VITE_API_URL' .env.production || true
npm run build

echo ""
echo "[9/9] Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "========================================"
echo "Superadmin Deployment Completed!"
echo "========================================"

EOF