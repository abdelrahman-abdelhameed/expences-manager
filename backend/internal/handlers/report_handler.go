package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/gorilla/mux"
)

type ReportHandler struct{}

func NewReportHandler() *ReportHandler {
	return &ReportHandler{}
}

type MonthlyReport struct {
	Year          int                      `json:"year"`
	Month         int                      `json:"month"`
	TotalExpenses float64                  `json:"total_expenses"`
	TotalPlanned  float64                  `json:"total_planned"`
	ExpenseCount  int64                    `json:"expense_count"`
	ByCategory    []CategoryExpenseSummary `json:"by_category"`
}

type CategoryExpenseSummary struct {
	CategoryID    *uint   `json:"category_id"`
	CategoryName  string  `json:"category_name"`
	CategoryColor string  `json:"category_color"`
	TotalAmount   float64 `json:"total_amount"`
	ExpenseCount  int64   `json:"expense_count"`
	PlannedAmount float64 `json:"planned_amount"`
}

type MonthComparison struct {
	Year          int     `json:"year"`
	Month         int     `json:"month"`
	TotalExpenses float64 `json:"total_expenses"`
	ExpenseCount  int64   `json:"expense_count"`
}

// GetMonthlyReport returns a comprehensive report for a specific month for the authenticated user
func (h *ReportHandler) GetMonthlyReport(w http.ResponseWriter, r *http.Request) {
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

	// Get start and end dates for the month
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	// Get total expenses
	var totalExpenses float64
	var expenseCount int64
	database.GetDB().Model(&models.DailyExpense{}).
		Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalExpenses)

	database.GetDB().Model(&models.DailyExpense{}).
		Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
		Count(&expenseCount)

	// Get total planned
	var totalPlanned float64
	database.GetDB().Model(&models.MonthlyPlan{}).
		Where("user_id = ? AND year = ? AND month = ?", userID, year, month).
		Select("COALESCE(SUM(planned_amount), 0)").
		Scan(&totalPlanned)

	// Get expenses by category
	var categoryExpenses []CategoryExpenseSummary
	database.GetDB().Model(&models.DailyExpense{}).
		Select("category_id, COUNT(*) as expense_count, SUM(amount) as total_amount").
		Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
		Group("category_id").
		Scan(&categoryExpenses)

	// Enrich with category details and planned amounts
	for i := range categoryExpenses {
		if categoryExpenses[i].CategoryID != nil {
			var category models.Category
			// We only query the category table, we trust the category exists if referenced
			if err := database.GetDB().First(&category, *categoryExpenses[i].CategoryID).Error; err == nil {
				categoryExpenses[i].CategoryName = category.Name
				categoryExpenses[i].CategoryColor = category.Color
			}

			// Get planned amount for this category
			var plan models.MonthlyPlan
			if err := database.GetDB().Where("user_id = ? AND year = ? AND month = ? AND category_id = ?",
				userID, year, month, *categoryExpenses[i].CategoryID).First(&plan).Error; err == nil {
				categoryExpenses[i].PlannedAmount = plan.PlannedAmount
			}
		} else {
			categoryExpenses[i].CategoryName = "Uncategorized"
			categoryExpenses[i].CategoryColor = "#9CA3AF"
		}
	}

	report := MonthlyReport{
		Year:          year,
		Month:         month,
		TotalExpenses: totalExpenses,
		TotalPlanned:  totalPlanned,
		ExpenseCount:  expenseCount,
		ByCategory:    categoryExpenses,
	}

	respondWithJSON(w, http.StatusOK, report)
}

// GetCategoryReport returns expenses grouped by category for a specific month for the authenticated user
func (h *ReportHandler) GetCategoryReport(w http.ResponseWriter, r *http.Request) {
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

	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	var categoryExpenses []CategoryExpenseSummary
	database.GetDB().Model(&models.DailyExpense{}).
		Select("category_id, COUNT(*) as expense_count, SUM(amount) as total_amount").
		Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
		Group("category_id").
		Scan(&categoryExpenses)

	// Enrich with category details
	for i := range categoryExpenses {
		if categoryExpenses[i].CategoryID != nil {
			var category models.Category
			if err := database.GetDB().First(&category, *categoryExpenses[i].CategoryID).Error; err == nil {
				categoryExpenses[i].CategoryName = category.Name
				categoryExpenses[i].CategoryColor = category.Color
			}
		} else {
			categoryExpenses[i].CategoryName = "Uncategorized"
			categoryExpenses[i].CategoryColor = "#9CA3AF"
		}
	}

	respondWithJSON(w, http.StatusOK, categoryExpenses)
}

// GetMonthComparison compares expenses across multiple months for the authenticated user
func (h *ReportHandler) GetMonthComparison(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Get months from query params (format: YYYY-MM)
	monthsParam := r.URL.Query()["months[]"]
	// Also support "months" (standard query param array handling varies)
	if len(monthsParam) == 0 {
		monthsParam = r.URL.Query()["months"]
	}

	if len(monthsParam) == 0 {
		respondWithError(w, http.StatusBadRequest, "At least one month is required")
		return
	}

	var comparisons []MonthComparison

	for _, monthStr := range monthsParam {
		t, err := time.Parse("2006-01", monthStr)
		if err != nil {
			continue
		}

		year := t.Year()
		month := int(t.Month())

		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

		var totalExpenses float64
		var expenseCount int64

		database.GetDB().Model(&models.DailyExpense{}).
			Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&totalExpenses)

		database.GetDB().Model(&models.DailyExpense{}).
			Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
			Count(&expenseCount)

		comparisons = append(comparisons, MonthComparison{
			Year:          year,
			Month:         month,
			TotalExpenses: totalExpenses,
			ExpenseCount:  expenseCount,
		})
	}

	respondWithJSON(w, http.StatusOK, comparisons)
}

// GetYearlyTrends returns monthly expense trends for a year for the authenticated user
func (h *ReportHandler) GetYearlyTrends(w http.ResponseWriter, r *http.Request) {
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

	var trends []MonthComparison

	for month := 1; month <= 12; month++ {
		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

		var totalExpenses float64
		var expenseCount int64

		database.GetDB().Model(&models.DailyExpense{}).
			Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&totalExpenses)

		database.GetDB().Model(&models.DailyExpense{}).
			Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
			Count(&expenseCount)

		trends = append(trends, MonthComparison{
			Year:          year,
			Month:         month,
			TotalExpenses: totalExpenses,
			ExpenseCount:  expenseCount,
		})
	}

	respondWithJSON(w, http.StatusOK, trends)
}
