package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type BankAccountHandler struct{}

func NewBankAccountHandler() *BankAccountHandler {
	return &BankAccountHandler{}
}

// GetBankAccounts returns all bank accounts for the authenticated user
func (h *BankAccountHandler) GetBankAccounts(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var accounts []models.BankAccount
	if err := database.GetDB().Where("user_id = ?", userID).Order("created_at DESC").Find(&accounts).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch bank accounts")
		return
	}

	if accounts == nil {
		accounts = []models.BankAccount{}
	}

	respondWithJSON(w, http.StatusOK, accounts)
}

// GetBankAccount returns a single bank account by ID for the authenticated user
func (h *BankAccountHandler) GetBankAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	respondWithJSON(w, http.StatusOK, account)
}

// CreateBankAccount creates a new bank account for the authenticated user
func (h *BankAccountHandler) CreateBankAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var account models.BankAccount
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate required fields
	if account.AccountName == "" {
		respondWithError(w, http.StatusBadRequest, "Account name is required")
		return
	}
	if account.BankName == "" {
		respondWithError(w, http.StatusBadRequest, "Bank name is required")
		return
	}
	if account.AccountType == "" {
		respondWithError(w, http.StatusBadRequest, "Account type is required")
		return
	}

	account.UserID = userID

	if err := database.GetDB().Create(&account).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create bank account")
		return
	}

	respondWithJSON(w, http.StatusCreated, account)
}

// UpdateBankAccount updates an existing bank account for the authenticated user
func (h *BankAccountHandler) UpdateBankAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	var updateData models.BankAccount
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Update fields
	if updateData.AccountName != "" {
		account.AccountName = updateData.AccountName
	}
	if updateData.BankName != "" {
		account.BankName = updateData.BankName
	}
	if updateData.AccountType != "" {
		account.AccountType = updateData.AccountType
	}
	if updateData.AccountNumber != "" {
		account.AccountNumber = updateData.AccountNumber
	}
	if updateData.Currency != "" {
		account.Currency = updateData.Currency
	}
	if updateData.Balance >= 0 {
		account.Balance = updateData.Balance
	}
	if updateData.Color != "" {
		account.Color = updateData.Color
	}
	if updateData.Icon != "" {
		account.Icon = updateData.Icon
	}
	account.IsActive = updateData.IsActive
	account.Notes = updateData.Notes

	if err := database.GetDB().Save(&account).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update bank account")
		return
	}

	respondWithJSON(w, http.StatusOK, account)
}

// DeleteBankAccount deletes a bank account for the authenticated user
func (h *BankAccountHandler) DeleteBankAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	if err := database.GetDB().Delete(&account).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete bank account")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Bank account deleted successfully"})
}

// GetBankAccountBalance returns the current balance of a bank account
func (h *BankAccountHandler) GetBankAccountBalance(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"id":       account.ID,
		"balance":  account.Balance,
		"currency": account.Currency,
	})
}

// UpdateBankAccountBalance updates the balance of a bank account
func (h *BankAccountHandler) UpdateBankAccountBalance(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	var balanceData map[string]float64
	if err := json.NewDecoder(r.Body).Decode(&balanceData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if balance, ok := balanceData["balance"]; ok {
		account.Balance = balance
		if err := database.GetDB().Save(&account).Error; err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to update balance")
			return
		}
	}

	respondWithJSON(w, http.StatusOK, account)
}

// GetBankAccountTransactions returns recent transactions for a bank account
func (h *BankAccountHandler) GetBankAccountTransactions(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	limit := 50
	if limitParam := r.URL.Query().Get("limit"); limitParam != "" {
		if parsed, err := strconv.Atoi(limitParam); err == nil && parsed > 0 {
			if parsed > 200 {
				parsed = 200
			}
			limit = parsed
		}
	}

	var account models.BankAccount
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Bank account not found")
		return
	}

	var transactions []models.BankAccountTransaction
	if err := database.GetDB().
		Where("bank_account_id = ? AND user_id = ?", account.ID, userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&transactions).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch transactions")
		return
	}

	if transactions == nil {
		transactions = []models.BankAccountTransaction{}
	}

	respondWithJSON(w, http.StatusOK, transactions)
}

type bankAccountTransactionRequest struct {
	Amount      float64 `json:"amount"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
}

// CreateBankAccountTransaction adds or subtracts money from a bank account
func (h *BankAccountHandler) CreateBankAccountTransaction(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid bank account ID")
		return
	}

	var req bankAccountTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Amount <= 0 {
		respondWithError(w, http.StatusBadRequest, "Amount must be greater than zero")
		return
	}

	transactionType, err := normalizeTransactionType(req.Type)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	var updatedAccount models.BankAccount
	var createdTransaction models.BankAccountTransaction

	if err := database.GetDB().Transaction(func(tx *gorm.DB) error {
		var account models.BankAccount
		if err := tx.Where("id = ? AND user_id = ?", id, userID).First(&account).Error; err != nil {
			return err
		}

		newBalance := account.Balance
		switch transactionType {
		case "credit":
			newBalance += req.Amount
		case "debit":
			if account.Balance-req.Amount < 0 {
				return errors.New("Insufficient funds")
			}
			newBalance -= req.Amount
		}

		account.Balance = newBalance
		if err := tx.Save(&account).Error; err != nil {
			return err
		}

		transaction := models.BankAccountTransaction{
			UserID:        userID,
			BankAccountID: account.ID,
			Type:          transactionType,
			Amount:        req.Amount,
			Description:   req.Description,
		}
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		updatedAccount = account
		createdTransaction = transaction
		return nil
	}); err != nil {
		if err.Error() == "Insufficient funds" {
			respondWithError(w, http.StatusBadRequest, "Insufficient funds")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to create transaction")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"transaction": createdTransaction,
		"balance":     updatedAccount.Balance,
	})
}

func normalizeTransactionType(input string) (string, error) {
	value := strings.ToLower(strings.TrimSpace(input))
	switch value {
	case "credit", "add", "deposit", "in":
		return "credit", nil
	case "debit", "sub", "subtract", "withdraw", "out":
		return "debit", nil
	default:
		return "", errors.New("Transaction type must be add/credit or sub/debit")
	}
}
