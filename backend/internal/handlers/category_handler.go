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

type CategoryHandler struct{}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{}
}

// GetCategories returns all categories for the authenticated user
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var categories []models.Category
	if err := database.GetDB().Where("user_id = ?", userID).Find(&categories).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	respondWithJSON(w, http.StatusOK, categories)
}

// GetCategory returns a single category by ID for the authenticated user
func (h *CategoryHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid category ID")
		return
	}

	var category models.Category
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&category).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Category not found")
		return
	}

	respondWithJSON(w, http.StatusOK, category)
}

// CreateCategory creates a new category for the authenticated user
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var category models.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if category.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Category name is required")
		return
	}

	// Set the user ID
	category.UserID = userID

	if err := database.GetDB().Create(&category).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create category")
		return
	}

	respondWithJSON(w, http.StatusCreated, category)
}

// UpdateCategory updates an existing category for the authenticated user
func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid category ID")
		return
	}

	var category models.Category
	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).First(&category).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "Category not found")
		return
	}

	var updateData models.Category
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Update fields
	if updateData.Name != "" {
		category.Name = updateData.Name
	}
	if updateData.Description != "" {
		category.Description = updateData.Description
	}
	if updateData.Color != "" {
		category.Color = updateData.Color
	}
	if updateData.Icon != "" {
		category.Icon = updateData.Icon
	}

	if err := database.GetDB().Save(&category).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update category")
		return
	}

	respondWithJSON(w, http.StatusOK, category)
}

// DeleteCategory deletes a category for the authenticated user
func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid category ID")
		return
	}

	if err := database.GetDB().Where("id = ? AND user_id = ?", id, userID).Delete(&models.Category{}).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to delete category")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Category deleted successfully"})
}
