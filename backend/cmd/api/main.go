package main

import (
	"log"
	"net/http"

	"github.com/abdelrahman/expense-manager/internal/config"
	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/handlers"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/abdelrahman/expense-manager/internal/utils"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize JWT
	utils.InitJWT(cfg.JWTSecret)

	// Connect to database
	if err := database.Connect(cfg.GetDSN()); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models
	db := database.GetDB()
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.DailyExpense{},
		&models.MonthlyPlan{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	categoryHandler := handlers.NewCategoryHandler()
	expenseHandler := handlers.NewExpenseHandler()
	monthlyPlanHandler := handlers.NewMonthlyPlanHandler()
	reportHandler := handlers.NewReportHandler()

	// Setup router
	router := mux.NewRouter()

	// Public routes (no authentication required)
	publicAPI := router.PathPrefix("/api/auth").Subrouter()
	publicAPI.HandleFunc("/register", authHandler.Register).Methods("POST")
	publicAPI.HandleFunc("/login", authHandler.Login).Methods("POST")

	// Protected routes (authentication required)
	api := router.PathPrefix("/api").Subrouter()
	api.Use(middleware.Auth)

	// Auth routes (protected)
	api.HandleFunc("/auth/me", authHandler.GetCurrentUser).Methods("GET")
	api.HandleFunc("/auth/profile", authHandler.UpdateProfile).Methods("PUT")

	// Category routes
	api.HandleFunc("/categories", categoryHandler.GetCategories).Methods("GET")
	api.HandleFunc("/categories", categoryHandler.CreateCategory).Methods("POST")
	api.HandleFunc("/categories/{id}", categoryHandler.GetCategory).Methods("GET")
	api.HandleFunc("/categories/{id}", categoryHandler.UpdateCategory).Methods("PUT")
	api.HandleFunc("/categories/{id}", categoryHandler.DeleteCategory).Methods("DELETE")

	// Expense routes
	api.HandleFunc("/expenses", expenseHandler.GetExpenses).Methods("GET")
	api.HandleFunc("/expenses", expenseHandler.CreateExpense).Methods("POST")
	api.HandleFunc("/expenses/{id}", expenseHandler.GetExpense).Methods("GET")
	api.HandleFunc("/expenses/{id}", expenseHandler.UpdateExpense).Methods("PUT")
	api.HandleFunc("/expenses/{id}", expenseHandler.DeleteExpense).Methods("DELETE")
	api.HandleFunc("/expenses/daily/{date}", expenseHandler.GetExpensesByDate).Methods("GET")

	// Monthly plan routes
	api.HandleFunc("/monthly-plans", monthlyPlanHandler.GetMonthlyPlans).Methods("GET")
	api.HandleFunc("/monthly-plans", monthlyPlanHandler.CreateMonthlyPlan).Methods("POST")
	api.HandleFunc("/monthly-plans/{id}", monthlyPlanHandler.GetMonthlyPlan).Methods("GET")
	api.HandleFunc("/monthly-plans/{id}", monthlyPlanHandler.UpdateMonthlyPlan).Methods("PUT")
	api.HandleFunc("/monthly-plans/{id}", monthlyPlanHandler.DeleteMonthlyPlan).Methods("DELETE")
	api.HandleFunc("/monthly-plans/{year}/{month}", monthlyPlanHandler.GetMonthlyPlanByYearMonth).Methods("GET")

	// Report routes
	api.HandleFunc("/reports/monthly/{year}/{month}", reportHandler.GetMonthlyReport).Methods("GET")
	api.HandleFunc("/reports/category/{year}/{month}", reportHandler.GetCategoryReport).Methods("GET")
	api.HandleFunc("/reports/comparison", reportHandler.GetMonthComparison).Methods("GET")
	api.HandleFunc("/reports/trends/{year}", reportHandler.GetYearlyTrends).Methods("GET")

	// Health check (public)
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	}).Methods("GET")

	// Apply logging middleware to all routes
	router.Use(middleware.Logger)

	// Setup CORS
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Start server
	addr := ":" + cfg.ServerPort
	log.Printf("Server starting on port %s", cfg.ServerPort)
	log.Fatal(http.ListenAndServe(addr, corsHandler.Handler(router)))
}
