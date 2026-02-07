# Expense Manager - Setup Guide

## Quick Start

### Step 1: Database Setup

You need to set up MySQL first. Choose one of the following options:

#### Option A: Using existing MySQL installation

1. Update the `backend/.env` file with your MySQL credentials:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=expense_manager
SERVER_PORT=8080
JWT_SECRET=your-secret-key-change-this-in-production
```

2. Create the database:
```bash
mysql -u your_mysql_user -p
# Enter your password when prompted
CREATE DATABASE expense_manager;
exit;
```

#### Option B: Using Docker (Recommended for testing)

```bash
# Run MySQL in Docker
docker run --name expense-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=expense_manager \
  -e MYSQL_USER=expenseuser \
  -e MYSQL_PASSWORD=expensepass \
  -p 3306:3306 \
  -d mysql:8.0

# Update backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=expenseuser
DB_PASSWORD=expensepass
DB_NAME=expense_manager
SERVER_PORT=8080
```

### Step 2: Start Backend

```bash
cd backend
go mod download
go run cmd/api/main.go
```

You should see:
```
Database migration completed successfully
Server starting on port 8086
```

### Step 3: Start Frontend

Open a new terminal:

```bash
cd frontend
npm install  # If not already done
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Use the Application

1. **Create Categories** (e.g., Food, Transport, Entertainment)
2. **Add Daily Expenses** with amounts and categories
3. **Set Monthly Budgets** for each category
4. **View Dashboard** to see your spending visualized
5. **Compare Months** to track trends

## Troubleshooting

### MySQL Connection Issues

If you get "Access denied" errors:

1. Check your MySQL credentials in `backend/.env`
2. Make sure MySQL is running: `sudo systemctl status mysql`
3. Try connecting manually: `mysql -u root -p`
4. For Ubuntu/Debian, you might need to use sudo: `sudo mysql`

### Port Already in Use

If port 8080 or 5173 is already in use:

**Backend:** Change `SERVER_PORT` in `backend/.env`

**Frontend:** Vite will automatically use the next available port

### CORS Errors

Make sure the backend is running before starting the frontend. The backend is configured to accept requests from `http://localhost:5173`.

## Features Overview

### Dashboard 📊
- Monthly expense summary
- Yearly trends chart
- Category breakdown (pie chart)
- Recent expenses list

### Daily Expenses 💵
- Add/edit/delete expenses
- Filter by date range and category
- View total spending

### Monthly Plan 📅
- Set budget per category
- Track actual vs planned spending
- Visual progress bars
- Over-budget alerts

### Categories 🏷️
- Create custom categories
- Choose colors and icons
- Edit/delete categories

### Month Comparison 📈
- Select multiple months
- Side-by-side comparison
- Percentage change indicators
- Detailed comparison table

## API Testing

You can test the API directly using `curl`. Since authentication is enabled, you first need to register/login and get a token.
	
	### 1. Register/Login & Get Token
	
	```bash
	# Register a new user
	curl -X POST http://localhost:8086/api/auth/register \
	  -H "Content-Type: application/json" \
	  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
	
	# OR Login (if already registered)
	# This will return a token. Copy it.
	curl -X POST http://localhost:8086/api/auth/login \
	  -H "Content-Type: application/json" \
	  -d '{"email":"test@example.com","password":"password123"}'
	```
	
	### 2. Export Token
	
	```bash
	export TOKEN="your_token_from_login_response"
	```
	
	### 3. Make Authenticated Requests

```bash
# Health check
curl http://localhost:8086/health

# Create a category
curl -X POST http://localhost:8086/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Food","color":"#10B981","icon":"🍔"}'

# Create an expense
curl -X POST http://localhost:8086/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 25.50,
    "description": "Lunch",
    "expense_date": "2026-02-07T00:00:00Z",
    "category_id": 1
  }'

# Get monthly report
curl -H "Authorization: Bearer $TOKEN" http://localhost:8086/api/reports/monthly/2026/2
```

## Next Steps

- Customize categories for your needs
- Start tracking your daily expenses
- Set realistic monthly budgets
- Review your spending patterns regularly

Enjoy managing your expenses! 💰
