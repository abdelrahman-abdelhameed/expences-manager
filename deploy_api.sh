#!/bin/bash
set -e
echo "Starting deployment setup..."
# Check Go version
echo "Checking Go version..."
go version  # Should show Go 1.21 or higher

# Check MySQL version
echo "Checking MySQL version..."
mysql --version  # Verify MySQL is installed

# # Build the API
# echo "Building API..."
# go build -o api .

# # Run the API
# echo "Starting API server..."
# ./api


# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE expense_manager;
CREATE USER 'expenseuser'@'localhost' IDENTIFIED BY 'expensepass';
GRANT ALL PRIVILEGES ON expense_manager.* TO 'expenseuser'@'localhost';
FLUSH PRIVILEGES;
exit;

cat backend/.env

cd backend

# Download dependencies
go mod download

# Run the API
go run cmd/api/main.go


# Check status
sudo systemctl status expense-api.service

# View logs
journalctl -u expense-api.service -f

# Restart service
sudo systemctl restart expense-api.service

# Stop service
#!/bin/bash
set -e

echo "Starting deployment setup..."

# Check Go version
echo "Checking Go version..."
go version

# Check MySQL version
echo "Checking MySQL version..."
mysql --version

# Login to MySQL and setup database
echo "Setting up database..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS expense_manager;
CREATE USER IF NOT EXISTS 'expenseuser'@'localhost' IDENTIFIED BY 'expensepass';
GRANT ALL PRIVILEGES ON expense_manager.* TO 'expenseuser'@'localhost';
FLUSH PRIVILEGES;
EOF

# Load environment variables
if [ -f backend/.env ]; then
    cat backend/.env
else
    echo "Warning: backend/.env not found"
fi

cd backend

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Build the API
echo "Building API..."
go build -o api cmd/api/main.go

# Run the API
echo "Starting API server..."
./api

# Optional: Setup systemd service
echo "API deployment complete!"

