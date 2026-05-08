ssh -i "C:\Users\sta\Desktop\chataffy-imp-data\chataffy-test.pem" ubuntu@34.213.132.47 << 'EOF'

cd /var/www/html/chataffy/superadmin

git pull

npm install

npm run build

sudo systemctl reload nginx

EOF


