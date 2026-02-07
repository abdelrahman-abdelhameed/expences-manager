package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/gorilla/mux"
)

type ExpenseHandler struct{}

func NewExpenseHandler() *ExpenseHandler {
	return &ExpenseHandler{}
}

// GetExpenses returns expenses with optional filters for the authenticated user
func (h *ExpenseHandler) GetExpenses(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	query := database.GetDB().Preload("Category").Where("daily_expenses.user_id = ?", userID)

	// Filter by date range
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		query = query.Where("expense_date >= ?", startDate)
	}
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		query = query.Where("expense_date <= ?", endDate)
	}

	// Filter by category
	if categoryID := r.URL.Query().Get("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	var expenses []models.DailyExpense
	if err := query.Order("expense_date DESC").Find(&expenses).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expenses")
		return
	}

	respondWithJSON(w, http.StatusOK, expenses)
}

// GetExpense returns a single expense by ID for the authenticated user
func (h *ExpenseHandler) GetExpense(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	var expense models.DailyExpense
	if err := database.GetDB().Preload("Category").Where("id = ? AND user_id = ?", id, userID).First(&expense).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Expense not found")
		return
	}

	respondWithJSON(w, http.StatusOK, expense)
}

// GetExpensesByDate returns expenses for a specific date for the authenticated user
func (h *ExpenseHandler) GetExpensesByDate(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	dateStr := vars["date"]

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD")
		return
	}

	var expenses []models.DailyExpense
	if err := database.GetDB().Preload("Category").
		Where("expense_date = ? AND user_id = ?", date, userID).
		Order("created_at DESC").
		Find(&expenses).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch expenses")
		return
	}

	respondWithJSON(w, http.StatusOK, expenses)
}

// CreateExpense creates a new expense for the authenticated user
func (h *ExpenseHandler) CreateExpense(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var expense models.DailyExpense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if expense.Amount <= 0 {
		respondWithError(w, http.StatusBadRequest, "Amount must be greater than 0")
		return
	}

	// Set the user ID
	expense.UserID = userID

	if err := database.GetDB().Create(&expense).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create expense")
		return
	}

	// Reload with category
	database.GetDB().Preload("Category").First(&expense, expense.ID)

	respondWithJSON(w, http.StatusCreated, expense)
}

// UpdateExpense updates an existing expense for the authenticated user
func (h *ExpenseHandler) UpdateExpense(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	var expense models.DailyExpense
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&expense).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Expense not found")
		return
	}

	var updateData models.DailyExpense
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Update fields
	if updateData.Amount > 0 {
		expense.Amount = updateData.Amount
	}
	if updateData.Description != "" {
		expense.Description = updateData.Description
	}
	if !updateData.ExpenseDate.IsZero() {
		expense.ExpenseDate = updateData.ExpenseDate
	}
	if updateData.CategoryID != nil {
		expense.CategoryID = updateData.CategoryID
	}

	if err := database.GetDB().Save(&expense).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update expense")
		return
	}

	// Reload with category
	database.GetDB().Preload("Category").First(&expense, expense.ID)

	respondWithJSON(w, http.StatusOK, expense)
}

// DeleteExpense deletes an expense for the authenticated user
func (h *ExpenseHandler) DeleteExpense(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).Delete(&models.DailyExpense{}).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete expense")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Expense deleted successfully"})
}
