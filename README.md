# Expense Management Application

A full-stack web application for managing daily and monthly expenses with comprehensive reporting and analytics.

## Features

- 📊 **Dashboard** - Visual overview with charts and statistics
- 💵 **Daily Expenses** - Track daily spending with categories
- 📅 **Monthly Budget Planning** - Set and monitor monthly budgets
- 🏷️ **Category Management** - Organize expenses with custom categories
- 📈 **Month Comparison** - Compare expenses across different months
- 📊 **Reports & Analytics** - Detailed insights and trends

## Tech Stack

### Backend
- **Go** - REST API server
- **MySQL** - Database
- **GORM** - ORM
- **Gorilla Mux** - HTTP router
- **CORS** - Cross-origin support

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Prerequisites

- Go 1.21 or higher
- MySQL 8.0 or higher
- Node.js 18 or higher
- npm or yarn

## Installation

### 1. Clone and Setup Database

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE expense_manager;
exit;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=expense_manager
# SERVER_PORT=8080

# Install dependencies
go mod download

# Run the server
go run cmd/api/main.go
```

The API will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will open at `http://localhost:5173`

## Usage

1. **Create Categories** - Start by creating expense categories (Food, Transport, etc.)
2. **Add Daily Expenses** - Record your daily spending
3. **Set Monthly Budgets** - Plan your monthly spending per category
4. **View Dashboard** - Monitor your spending with visual charts
5. **Compare Months** - Analyze spending trends over time

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/daily/:date` - Get expenses by date

### Monthly Plans
- `GET /api/monthly-plans` - List plans
- `POST /api/monthly-plans` - Create plan
- `PUT /api/monthly-plans/:id` - Update plan
- `DELETE /api/monthly-plans/:id` - Delete plan
- `GET /api/monthly-plans/:year/:month` - Get plans by month

### Reports
- `GET /api/reports/monthly/:year/:month` - Monthly report
- `GET /api/reports/category/:year/:month` - Category breakdown
- `GET /api/reports/comparison?months[]=2026-01&months[]=2026-02` - Compare months
- `GET /api/reports/trends/:year` - Yearly trends

## Project Structure

```
expences/
├── backend/
│   ├── cmd/api/
│   │   └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── models/
│   ├── go.mod
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env
└── README.md
```

## Development

### Backend
```bash
cd backend
go run cmd/api/main.go
```

### Frontend
```bash
cd frontend
npm run dev
```

## Building for Production

### Backend
```bash
cd backend
go build -o expense-api cmd/api/main.go
./expense-api
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred web server
```

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
