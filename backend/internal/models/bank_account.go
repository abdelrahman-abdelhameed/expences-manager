package models

import (
	"time"
)

type BankAccount struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;index:idx_user_id"`
	AccountName   string    `json:"account_name" gorm:"size:100;not null"`
	BankName      string    `json:"bank_name" gorm:"size:100;not null"`
	AccountType   string    `json:"account_type" gorm:"size:50;not null"` // Checking, Savings, Credit Card, etc.
	Balance       float64   `json:"balance" gorm:"type:decimal(10,2);default:0"`
	Currency      string    `json:"currency" gorm:"size:3;default:ِSAR"`    // ISO currency code
	AccountNumber string    `json:"account_number" gorm:"size:20;not null"` // Last 4 digits recommended
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	Color         string    `json:"color" gorm:"size:7;default:#3B82F6"`
	Icon          string    `json:"icon" gorm:"size:50;default:bank"`
	Notes         string    `json:"notes" gorm:"type:text"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (BankAccount) TableName() string {
	return "bank_accounts"
}
