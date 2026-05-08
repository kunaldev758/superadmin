ssh -i "C:\Users\sta\Desktop\chataffy-imp-data\chataffy-test.pem" ubuntu@34.213.132.47 << 'EOF'

echo "========================================"
echo "Starting Superadmin Deployment..."
echo "========================================"

echo ""
echo "[1/6] Moving to project directory..."
cd /var/www/html/chataffy/superadmin || exit

echo ""
echo "[2/6] Current directory:"
pwd

echo ""
echo "[3/6] Pulling latest code from GitHub..."
git pull

echo ""
echo "[4/6] Installing npm dependencies..."
npm install

echo ""
echo "[5/6] Building Vite production app..."
npm run build

echo ""
echo "[6/6] Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "========================================"
echo "Superadmin Deployment Completed!"
echo "========================================"

EOF

