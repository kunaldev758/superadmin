#!/bin/bash

echo "========================================"
echo "Starting Superadmin Deployment Script"
echo "========================================"

# Detect current local git branch
CURRENT_BRANCH=$(git branch --show-current)

echo "Local Current Branch: $CURRENT_BRANCH"
echo "Connecting to EC2..."

ssh -i "C:\Users\sta\Desktop\chataffy-imp-data\chataffy-key1.pem" ubuntu@34.213.132.47 << EOF

set -e

echo ""
echo "========================================"
echo "Connected to EC2 Successfully"
echo "========================================"

echo ""
echo "[1/12] Current Server User:"
whoami

echo ""
echo "[2/12] Moving to project directory..."
cd /var/www/html/chataffy/superadmin || exit 1

echo ""
echo "Current Directory:"
pwd

echo ""
echo "[3/12] Fixing git safe directory..."
git config --global --add safe.directory /var/www/html/chataffy/superadmin

echo ""
echo "[4/12] Fixing project ownership and permissions..."
sudo chown -R ubuntu:ubuntu /var/www/html/chataffy/superadmin
sudo chmod -R 755 /var/www/html/chataffy/superadmin

echo ""
echo "[5/12] Checking Node & NPM versions..."
node -v
npm -v

echo ""
echo "[6/12] Current Git Branch on Server:"
git branch --show-current

echo ""
echo "[7/12] Fetching latest code from GitHub..."
git fetch origin

echo ""
echo "Switching to Branch: $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

echo ""
echo "Resetting to latest origin/$CURRENT_BRANCH..."
git reset --hard origin/$CURRENT_BRANCH

echo ""
echo "Cleaning unnecessary files..."
git clean -fd -e .env -e .env.production -e .env.local

echo ""
echo "Latest Commit Details:"
git log -1

echo ""
echo "[8/12] Installing npm dependencies..."
npm install

echo ""
echo "[9/12] Creating .env.production..."

cat > .env.production <<'ENVEOF'
VITE_API_URL=/chataffy/chataffy/api/superadmin
ENVEOF

echo ""
echo "Generated .env.production:"
cat .env.production

echo ""
echo "[10/12] Building Vite Application..."
npm run build

echo ""
echo "Checking build folder..."
ls -la dist

echo ""
echo "[11/12] Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager

echo ""
echo "[12/12] Deployment Verification Completed"

echo ""
echo "========================================"
echo "Superadmin Deployment Completed Successfully!"
echo "========================================"

EOF

echo ""
echo "SSH Session Closed"
echo "Deployment Script Finished"

exit