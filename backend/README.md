# Expense Manager Backend

Go-based REST API for managing daily and monthly expenses.

## Prerequisites

- Go 1.21 or higher
- MySQL 8.0 or higher

## Setup

1. Install dependencies:
```bash
go mod download
```

2. Create a MySQL database:
```sql
CREATE DATABASE expense_manager;
```

3. Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

4. Run the application:
```bash
go run cmd/api/main.go
```

The API will start on `http://localhost:8080`

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a category
- `GET /api/categories/:id` - Get a category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Expenses
- `GET /api/expenses` - List expenses (supports filters: start_date, end_date, category_id)
- `POST /api/expenses` - Create an expense
- `GET /api/expenses/:id` - Get an expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/daily/:date` - Get expenses for a specific date (YYYY-MM-DD)

### Monthly Plans
- `GET /api/monthly-plans` - List monthly plans (supports filters: year, month)
- `POST /api/monthly-plans` - Create a monthly plan
- `GET /api/monthly-plans/:id` - Get a monthly plan
- `PUT /api/monthly-plans/:id` - Update a monthly plan
- `DELETE /api/monthly-plans/:id` - Delete a monthly plan
- `GET /api/monthly-plans/:year/:month` - Get plans for a specific month

### Reports
- `GET /api/reports/monthly/:year/:month` - Get monthly summary report
- `GET /api/reports/category/:year/:month` - Get expenses by category
- `GET /api/reports/comparison?months[]=2026-01&months[]=2026-02` - Compare multiple months
- `GET /api/reports/trends/:year` - Get yearly expense trends

### Health Check
- `GET /health` - API health status
