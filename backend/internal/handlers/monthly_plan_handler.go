package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/gorilla/mux"
)

type MonthlyPlanHandler struct{}

func NewMonthlyPlanHandler() *MonthlyPlanHandler {
	return &MonthlyPlanHandler{}
}

// GetMonthlyPlans returns all monthly plans for the authenticated user
func (h *MonthlyPlanHandler) GetMonthlyPlans(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var plans []models.MonthlyPlan
	query := database.GetDB().Preload("Category").Where("monthly_plans.user_id = ?", userID)

	// Filter by year
	if year := r.URL.Query().Get("year"); year != "" {
		query = query.Where("year = ?", year)
	}

	// Filter by month
	if month := r.URL.Query().Get("month"); month != "" {
		query = query.Where("month = ?", month)
	}

	if err := query.Order("year DESC, month DESC").Find(&plans).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch monthly plans")
		return
	}

	respondWithJSON(w, http.StatusOK, plans)
}

// GetMonthlyPlan returns a single monthly plan by ID for the authenticated user
func (h *MonthlyPlanHandler) GetMonthlyPlan(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}

	var plan models.MonthlyPlan
	if err := database.GetDB().Preload("Category").Where("id = ? AND user_id = ?", id, userID).First(&plan).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Monthly plan not found")
		return
	}

	respondWithJSON(w, http.StatusOK, plan)
}

// GetMonthlyPlanByYearMonth returns plans for a specific year and month for the authenticated user
func (h *MonthlyPlanHandler) GetMonthlyPlanByYearMonth(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid year")
		return
	}

	month, err := strconv.Atoi(vars["month"])
	if err != nil || month < 1 || month > 12 {
		respondWithError(w, http.StatusBadRequest, "Invalid month")
		return
	}

	var plans []models.MonthlyPlan
	if err := database.GetDB().Preload("Category").
		Where("year = ? AND month = ? AND user_id = ?", year, month, userID).
		Find(&plans).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch monthly plans")
		return
	}

	respondWithJSON(w, http.StatusOK, plans)
}

// CreateMonthlyPlan creates a new monthly plan for the authenticated user
func (h *MonthlyPlanHandler) CreateMonthlyPlan(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var plan models.MonthlyPlan
	if err := json.NewDecoder(r.Body).Decode(&plan); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if plan.Month < 1 || plan.Month > 12 {
		respondWithError(w, http.StatusBadRequest, "Month must be between 1 and 12")
		return
	}

	if plan.PlannedAmount <= 0 {
		respondWithError(w, http.StatusBadRequest, "Planned amount must be greater than 0")
		return
	}

	// Set the user ID
	plan.UserID = userID

	if err := database.GetDB().Create(&plan).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create monthly plan")
		return
	}

	// Reload with category
	database.GetDB().Preload("Category").First(&plan, plan.ID)

	respondWithJSON(w, http.StatusCreated, plan)
}

// UpdateMonthlyPlan updates an existing monthly plan for the authenticated user
func (h *MonthlyPlanHandler) UpdateMonthlyPlan(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}

	var plan models.MonthlyPlan
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&plan).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Monthly plan not found")
		return
	}

	var updateData models.MonthlyPlan
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Update fields
	if updateData.Month >= 1 && updateData.Month <= 12 {
		plan.Month = updateData.Month
	}
	if updateData.Year > 0 {
		plan.Year = updateData.Year
	}
	if updateData.PlannedAmount > 0 {
		plan.PlannedAmount = updateData.PlannedAmount
	}
	if updateData.CategoryID != nil {
		plan.CategoryID = updateData.CategoryID
	}

	if err := database.GetDB().Save(&plan).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update monthly plan")
		return
	}

	// Reload with category
	database.GetDB().Preload("Category").First(&plan, plan.ID)

	respondWithJSON(w, http.StatusOK, plan)
}

// DeleteMonthlyPlan deletes a monthly plan for the authenticated user
func (h *MonthlyPlanHandler) DeleteMonthlyPlan(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid plan ID")
		return
	}

	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).Delete(&models.MonthlyPlan{}).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete monthly plan")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Monthly plan deleted successfully"})
}
