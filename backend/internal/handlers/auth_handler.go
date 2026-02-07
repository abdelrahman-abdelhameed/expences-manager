package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/abdelrahman/expense-manager/internal/database"
	"github.com/abdelrahman/expense-manager/internal/middleware"
	"github.com/abdelrahman/expense-manager/internal/models"
	"github.com/abdelrahman/expense-manager/internal/utils"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

// Register creates a new user account
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" || req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Email, password, and name are required")
		return
	}

	// Validate email format
	if !strings.Contains(req.Email, "@") {
		respondWithError(w, http.StatusBadRequest, "Invalid email format")
		return
	}

	// Validate password length
	if len(req.Password) < 6 {
		respondWithError(w, http.StatusBadRequest, "Password must be at least 6 characters")
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.GetDB().Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		respondWithError(w, http.StatusConflict, "Email already registered")
		return
	}

	// Create user
	user := models.User{
		Email: req.Email,
		Name:  req.Name,
	}

	if err := user.HashPassword(req.Password); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	if err := database.GetDB().Create(&user).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondWithJSON(w, http.StatusCreated, AuthResponse{
		Token: token,
		User:  &user,
	})
}

// Login authenticates a user and returns a JWT token
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		respondWithError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Find user by email
	var user models.User
	if err := database.GetDB().Where("email = ?", req.Email).First(&user).Error; err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondWithJSON(w, http.StatusOK, AuthResponse{
		Token: token,
		User:  &user,
	})
}

// GetCurrentUser returns the authenticated user's information
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var user models.User
	if err := database.GetDB().First(&user, userID).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	respondWithJSON(w, http.StatusOK, user)
}

// UpdateProfile updates the authenticated user's profile
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var user models.User
	if err := database.GetDB().First(&user, userID).Error; err != nil {
		respondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	var updateData struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if updateData.Name != "" {
		user.Name = updateData.Name
	}

	if err := database.GetDB().Save(&user).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	respondWithJSON(w, http.StatusOK, user)
}
